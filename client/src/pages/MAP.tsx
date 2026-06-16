import { MapContainer, TileLayer, GeoJSON, useMap,  Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-gesture-handling/dist/leaflet-gesture-handling.css";
import React, { ChangeEvent, ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { Layer, LeafletMouseEvent, Map, Marker as MarkerType, Polygon, Tooltip } from "leaflet";
import { GestureHandling } from "leaflet-gesture-handling";
import { AiOutlineFullscreen, AiOutlineFullscreenExit } from "react-icons/ai";
import { useLoading } from "../context/LoadingContext";
import Button from "../components/Button";
import { MdCancel } from "react-icons/md";
import { FaMagnifyingGlassLocation } from "react-icons/fa6";
import { IoMdDoneAll } from "react-icons/io";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";
import { EventState, ILocation, Location, LocationState, PostState } from "../types/globals";
import { FaLock, FaLockOpen, FaPlus, FaMinus } from "react-icons/fa";
import { IoLocationSharp } from "react-icons/io5";

//this is beacuse icons dont load in prod, some bs idk
import L from "leaflet";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import useApi from "../hooks/useApi";
import { validateLocationFields } from "../utils/validate";

//the below line is because someone caches something
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const blueMarker = new L.Icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
  className: 'marker'
})

const orangeMarker = new L.Icon({
  iconUrl: '/assets/Map/orange-marker.png',
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
  className: 'marker'
});

type coordinatesErrorType = {
  lat: string;
  lng: string;
};

const MAP_CENTER: [number, number] = [13.006995870591474, 75.07172913896241];
const MAP_MAX_BOUNDS: [[number, number], [number, number]] = [
  [14.025289007277138, 73.94617968510107],
  [11.98870273390581, 76.19727859282375],
];
const MAP_MIN_ZOOM = 9;
const MAP_INITIAL_ZOOM = 9;

const MAP = ({
  minimal = false,
  children,
  ref,
  editMode = false,
  state,
  setState
}: {
  minimal?: boolean;
  children?: ReactNode;
  ref?: React.RefObject<HTMLDivElement | null>;
  editMode: boolean;
  state?: PostState | EventState | LocationState;
  setState?: React.Dispatch<React.SetStateAction<EventState | PostState | LocationState>>
}) => {
  const { id } = useParams();

  const [map, setMap] = useState<Map | null>(null);
  const [lock, setLock] = useState<boolean>(false);
  const [zoom, setZoom] = useState<number>(MAP_INITIAL_ZOOM);
  const [fullScreen, setFullScreen] = useState<boolean>(false);
  const [activeVillage, setActiveVillage] = useState<GeoJSON.Feature | null>(null);
  const [activeLocation, setActiveLocation] = useState<ILocation | null>(null);
  const [newLocation, setNewLocation] = useState<Location | null>(null);
  const [askForCoordinates, setAskForCoordinates] = useState<boolean>(false);
  const [coordinateErrors, setCoordinateErrors] = useState<coordinatesErrorType>({ lat: "", lng: "" });
  const [geoJsonData, setGeoJsonData] = useState<{ [key: string]: any }>({});
  const [existingLocations, setExistingLocations] = useState<ILocation[]>([]);

  const mapRef = useRef<HTMLDivElement | null>(null);
  const toolTipPane = useRef<Element>(null);
  const markers = useRef<Record<string, MarkerType>>({});
  const activeLayerRef = useRef<Polygon | null>(null);

  const { startLoading, stopLoading } = useLoading();

  const locationsApi = useApi("/locations?fields=name,coordinates,district,taluk,village", { auto: !minimal });
  const locationSubmitApi = useApi("/locations", { auto: false });

  useEffect(() => {
    if(locationsApi.data) {
      setExistingLocations(locationsApi.data.locations);
    }
  }, [locationsApi.data]);

  useEffect(() => {
    markers.current = existingLocations.reduce((acc: any, loc: ILocation) => ({
      ...acc,
      [loc.name]: null
    }), {});
  }, [existingLocations]);

  useEffect(() => {
    const fetchGeoJson = async (name: string) => {
      try {
        startLoading();
        const response = await fetch(`/assets/Map/${name}.geojson`);
        if (!response.ok) throw new Error(`Failed to fetch ${name}`);
        const data = await response.json();
        setGeoJsonData(prev => ({ ...prev, [name]: data }));
      } catch (error) {
        console.error(`Error loading ${name} GeoJSON:`, error);
      } finally {
        stopLoading();
      }
    };

    const geoJsonFiles = minimal
      ? ["districts"]
      : ["districts", "dakshina_kannada", "udupi", "kasaragod"];
    geoJsonFiles.forEach(fetchGeoJson);
  }, []);

  useEffect(() => {
    return () => {
      if (toolTipPane.current) {
        toolTipPane.current.innerHTML = "";
      }
    };
  }, [map]);

  // useEffect(() => {
  //   if (map && zoom > 15)
  //     setActiveVillage(null);
  // }, [zoom]);

  useEffect(() => {
    const handleFullScreenChange = () => {
      const isFs = document.fullscreenElement === mapRef.current;
      setFullScreen(isFs);
    };

    document.addEventListener("fullscreenchange", handleFullScreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullScreenChange);
  }, []);

  useEffect(() => {
    if (mapRef.current && map) {
      if (fullScreen && document.fullscreenElement !== mapRef.current) {
        mapRef.current.requestFullscreen();
      } else if (!fullScreen && document.fullscreenElement === mapRef.current) {
        document.exitFullscreen();
      }
    }
  }, [fullScreen, mapRef, map]);

  const handleMapReady = (mapInstance: Map) => {
    setMap(mapInstance);

    const tooltips = document.querySelector(".leaflet-tooltip-pane");
    if (tooltips) {
      toolTipPane.current = tooltips;
    }

    mapInstance.on("zoomstart", () => {
      if (toolTipPane.current) {
        toolTipPane.current.innerHTML = "";
      }
    });
  };

  const styles = {
    default: {
      color: "black",
      weight: 1,
      fillColor: "transparent",
      opacity: 0.5,
    },
    hover: {
      color: "red",
      weight: 2,
      fillColor: "pink",
      fillOpacity: 0.5,
      opacity: 1,
    },
    click: {
      color: "red",
      weight: 2,
      fillColor: "blue",
      fillOpacity: 0.5,
      opacity: 1,
    },
    viewMore: {
      color: "#E87E36",
      weight: 4,
      fillColor: "transparent"
    }
  };

  const onEachVillage = (feature: GeoJSON.Feature, layer: Layer) => {
    if (layer instanceof Polygon) {
      layer.setStyle(styles.default);
      layer.on({
        mouseover: () => {
          if (feature.properties?.VILLAGE && layer !== activeLayerRef.current) {
            const tooltip = new Tooltip({
              permanent: false,
              direction: "top",
              className: `global-tooltip village-name-tooltip ${feature.properties?.VILLAGE.split(" ").join("-")}`
            })
              .setContent(feature.properties.VILLAGE)
              .setLatLng(layer.getCenter());

            if (map) {
              tooltip.addTo(map);
            }
          }

          if (layer !== activeLayerRef.current) {
            layer.setStyle(styles.hover);
          }
        },

        mouseout: () => {
          if (!toolTipPane.current) return;
          
          const tooltip = toolTipPane.current.querySelector(`.${feature.properties?.VILLAGE.split(" ").join("-")}`);
          if(tooltip) tooltip.remove();
          if (layer !== activeLayerRef.current) {
            layer.setStyle(styles.default);
          }
        },

        click: () => {
          if (!toolTipPane.current) return;

          if (activeLayerRef.current && activeLayerRef.current !== layer) {
            activeLayerRef.current.setStyle(styles.default);
          }

          if (layer === activeLayerRef.current) {
            layer.setStyle(styles.default);
            activeLayerRef.current = null;
            setActiveVillage(null);
          } else {
            layer.setStyle(styles.click);
            activeLayerRef.current = layer;
            setActiveVillage(feature)
          }
        },
      });
    }
  };

  const districtKeys = ["dakshina_kannada", "udupi", "kasaragod"];
  const onEachUniteractiveVillage = (feature: GeoJSON.Feature, layer: Layer) => {
    if (editMode) {
      layer.on({
        click: (e: LeafletMouseEvent) => {
          setNewLocation({
            district: feature.properties?.DISTRICT,
            taluk: feature.properties?.TALUK,
            maagane: feature.properties?.MAAGANE,
            village: feature.properties?.VILLAGE,
            coordinates: [e.latlng.lat, e.latlng.lng]
          });
        }
      })
    }
  }

  const uninteractiveVillageLayers = useMemo(() => (
    <>
      {districtKeys.map((key) =>
        geoJsonData[key] && (
          <GeoJSON
            key={`u${key}`}
            data={geoJsonData[key]}
            style={{
              color: "black",
              weight: 1,
              fillColor: "transparent",
              opacity: 0.5
            }}
            onEachFeature={onEachUniteractiveVillage}
          />
        )
      )}
    </>
  ), [geoJsonData]);

  const villageLayers = useMemo(() => (
    <>
      {districtKeys.map((key) =>
        geoJsonData[key] && (
          <GeoJSON
            key={key}
            data={geoJsonData[key]}
            style={{
              color: "black",
              weight: 1,
              fillColor: "transparent",
              opacity: 0.5
            }}
            onEachFeature={onEachVillage}
          />
        )
      )}
    </>
  ), [geoJsonData]);

  // const handleView = () => {
  //   if (map && activeVillage && activeLayerRef.current) {
  //     activeLayerRef.current?.setStyle(styles.viewMore);
  //     const [xmin, ymin, xmax, ymax] = activeVillage.bbox!;
  //     map.flyTo([(ymin + ymax) / 2, (xmin + xmax) / 2], 14)
  //   }
  // }

  const handleCoordinateChange = (e: ChangeEvent<HTMLInputElement>) => {
    setCoordinateErrors((prev) => ({
      ...prev,
      [name]: ""
    }))

    const { name, value } = e.target;

    if (isNaN(Number(value)))
      return

    setActiveLocation(prev => ({
      ...prev!,
      [name]: value
    }))
  };

  const pointInPolygon = (point: number[], polygon: number[][]) => {
    const x = point[0], y = point[1];
    let inside = false;

    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i][0], yi = polygon[i][1];
      const xj = polygon[j][0], yj = polygon[j][1];

      if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
        inside = !inside;
      }
    }

    return inside;
  };

  const findLayerContainingCoordinates = (lat: number, lng: number, geoJsonData: any) => {
    const point = [lng, lat];
    const districtKeys = ["dakshina_kannada", "udupi", "kasaragod"];

    for (const key of districtKeys) {
      const data = geoJsonData[key];
      if (!data || !data.features) continue;

      for (const feature of data.features) {
        if (!feature.geometry) continue;

        const { geometry } = feature;

        if (geometry.type === "Polygon") {
          const coordinates = geometry.coordinates[0];
          if (pointInPolygon(point, coordinates)) {
            return {
              layerKey: key,
              feature: feature,
              properties: feature.properties
            };
          }
        } else if (geometry.type === "MultiPolygon") {
          for (const polygon of geometry.coordinates) {
            const coordinates = polygon[0];
            if (pointInPolygon(point, coordinates)) {
              return {
                layerKey: key,
                feature: feature,
                properties: feature.properties
              };
            }
          }
        }
      }
    }

    return null;
  };

  const handleCoordinatesSubmit = (e: React.SyntheticEvent<HTMLFormElement, SubmitEvent>) => {
    e.preventDefault();

    const newErrors = {
      lat: "",
      lng: ""
    }

    const lat = newLocation?.coordinates?.[0];
    const lng = newLocation?.coordinates?.[1];
    if (!lat) {
      newErrors.lat = "Latitude is required."
    }

    if (!lng) {
      newErrors.lng = "Longitude is required."
    }

    if (lat && (lat! > MAP_MAX_BOUNDS[0][0] || lat! < MAP_MAX_BOUNDS[1][0])) {
      newErrors.lat = "Latitude exceeds max bounds."
    }

    if (lng && (lng! > MAP_MAX_BOUNDS[1][1] || lng! < MAP_MAX_BOUNDS[0][1])) {
      newErrors.lng = "Longitude exceeds max bounds."
    }

    setCoordinateErrors(newErrors);
    const hasError = Object.values(newErrors).some(err => err !== "");
    if (hasError)
      return

    const containingLayer = findLayerContainingCoordinates(
      lat,
      lng,
      geoJsonData
    );

    if (!containingLayer) {
      toast.error("Somethig went wrong! Try again later");
    }

    map?.flyTo([lat, lng], 18);
    setNewLocation(prev => ({
      ...prev!,
      district: containingLayer?.properties.DISTRICT,
      taluk: containingLayer?.properties.TALUK,
      village: containingLayer?.properties.VILLAGE,
      maagane: containingLayer?.properties.MAAGANE
    }));
  };

  const handleSubmit = async () => {
    if(!editMode) return;

    if (editMode && !(state as LocationState)?.location?.district) {
      toast.error("You need to submit the location details first.")
      return;
    }

    await locationSubmitApi.refetch({ endpoint: `/drafts/location/${id}/location`, method: "POST", body: { location: state?.location } })
    setState?.(prev => ({
      ...prev,
      location: {
        ...(prev as LocationState).location,
        ...newLocation
      }
    }) as LocationState);

    toast.success("Location stored successfully.");
  }

  const handleZoomChange = (delta: number) => map && map.setZoom(zoom + delta);

  const MapEvents = () => {
    const leafletMap = useMap();

    useEffect(() => {
      setMap(leafletMap);
      handleMapReady(leafletMap);

      if (!leafletMap.hasEventListeners("gestureHandling")) {
        leafletMap.addHandler("gestureHandling", GestureHandling);
      }

      if (minimal || !fullScreen) {
        (leafletMap as any).gestureHandling?.enable();
      } else {
        (leafletMap as any).gestureHandling?.disable();
      }

      return () => {
        (leafletMap as any).gestureHandling?.disable();
      };
    }, [leafletMap, fullScreen]);

    useEffect(() => {
      if (leafletMap) {
        const handleZoom = () => setZoom(leafletMap.getZoom());
        leafletMap.on("zoomend", handleZoom);
        return () => {
          leafletMap.off("zoomend", handleZoom);
        };
      }
    }, [leafletMap]);

    useEffect(() => {
      if (!leafletMap) return;

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.ctrlKey) {
          leafletMap.scrollWheelZoom.enable();
        } else {
          leafletMap.scrollWheelZoom.disable();
        }
      };

      const handleKeyUp = () => {
        if (leafletMap) {
          leafletMap.scrollWheelZoom.disable();
        }
      };

      window.addEventListener("keydown", handleKeyDown);
      window.addEventListener("keyup", handleKeyUp);
      return () => {
        window.removeEventListener("keydown", handleKeyDown);
        window.removeEventListener("keyup", handleKeyUp);
      };
    }, [leafletMap]);

    useEffect(() => {
      if (leafletMap) {
        if (lock) {
          leafletMap.dragging.disable();
          leafletMap.touchZoom.disable();
          leafletMap.scrollWheelZoom.disable();
          leafletMap.boxZoom.disable();
          leafletMap.keyboard.disable();
        } else {
          leafletMap.dragging.enable();
          leafletMap.touchZoom.enable();
          leafletMap.boxZoom.enable();
          leafletMap.keyboard.enable();
        }
      }
    }, [leafletMap, lock]);

    return null;
  };

  const handleMarkerHover = (loc: ILocation) => {
    if(!map) return;

    const tooltip = new Tooltip({
      permanent: false,
      direction: "top",
      offset: [0, -41],
      className: `global-tooltip location-tooltip ${loc.name.split(" ").join("-")}`
    })
      .setContent(loc.name)
      .setLatLng([loc.coordinates?.[0], loc.coordinates?.[1]]);

    tooltip.addTo(map);
  }

  const handleMarkerOut = (loc: ILocation) => {
    if(!map || !toolTipPane.current) return;

    const tooltip = toolTipPane.current.querySelector(`.${loc.name.split(" ").join("-")}`);
    if(tooltip) tooltip.remove();
  }

  const handleMarkerClick = (e: LeafletMouseEvent, loc: ILocation) => {
    if(!map || !toolTipPane.current) return;
    if(editMode) return;

    if(activeLocation?.name) {
      const selectedMarker = markers.current[activeLocation.name];
      if(selectedMarker) {
        selectedMarker.setIcon(orangeMarker);
      }
    }

    const marker = e.target as L.Marker;
    marker.setIcon(blueMarker);
    if(editMode !== undefined) {
      setActiveLocation(loc);
      return;
    }

  }

  return (
    <div
      className={minimal
        ? "w-full h-full relative top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-3xl overflow-hidden"
        : "w-screen h-screen relative"
      }
      ref={minimal ? ref : mapRef}
    >
      {!minimal && (
        <style>
          {`
            .leaflet-interactive:focus{
              outline: none;
            }
            .global-tooltip {
              background-color: rgba(0, 0, 0, 0.8);
              color: white;
              border: none;
              border-radius: 4px;
              padding: 6px 10px;
              font-size: 12px;
              font-weight: 500;
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
              z-index: 20;
            }
            .global-tooltip:before {
              border-top-color: rgba(0, 0, 0, 0.8);
            }
            .permanent-tooltip {
              z-index: 30;
            }
          `}
        </style>
      )}

      {!minimal && (
        <div className="z-10 absolute flex flex-col justify-center items-center
          gap-2 right-0 top-16 -translate-x-1/2 -translate-y-1/2 cursor-pointer">
          {fullScreen ? (
            <AiOutlineFullscreenExit
              className="text-white text-[2.5rem] stroke-2 hover:scale-110"
              onClick={() => setFullScreen(false)}
            />
          ) : (
            <AiOutlineFullscreen
              className="text-white text-[2.5rem] stroke-2 hover:scale-110"
              onClick={() => setFullScreen(true)}
            />
          )}
          {
            editMode !== undefined && location &&
            <IoMdDoneAll
              className={`text-[2.5rem] 
                  ${activeLocation?.district || newLocation?.district ? "text-white hover:scale-110" : "cursor-not-allowed text-gray-400"}`}
              onClick={handleSubmit}
            />
          }
        </div>
      )}

      {!minimal && editMode && (
        !askForCoordinates ?
          (
            <div
              className="absolute left-5 top-1/2 -translate-y-1/2 z-10 bg-white hover:scale-105 
                p-2 rounded-xl hover:bg-primary text-back cursor-pointer text-[2rem]"
              onClick={() => setAskForCoordinates(true)}
            >
              <FaMagnifyingGlassLocation className="" />
            </div>
          ) :

          (
            <form
              className="absolute w-1/3 flex flex-col gap-3 left-5 top-1/2 -translate-y-1/2 z-10 bg-black
                p-6 rounded-xl text-back cursor-pointer"
              onSubmit={handleCoordinatesSubmit}>
              <MdCancel
                size={"25px"}
                className="absolute top-3 right-3 fill-white hover:fill-primary"
                onClick={() => setAskForCoordinates(false)}
              />
              <div className="w-full flex flex-col items-center justify-between gap-2">
                <label className="text-white" htmlFor="lat">Latitude</label>
                <input
                  className="p-1 bg-white w-4/5"
                  type="text"
                  id="lat"
                  name="lat"
                  autoComplete="off"
                  value={newLocation?.coordinates[0] ?? ""}
                  onChange={handleCoordinateChange}
                />
                {coordinateErrors.lat && <p className="text-red-500">{coordinateErrors.lat}</p>}
              </div>
              <div className="w-full flex flex-col items-center justify-between gap-2">
                <label className="text-white" htmlFor="lng">Longitude</label>
                <input
                  className="p-1 bg-white w-4/5"
                  type="text"
                  id="lng"
                  name="lng"
                  autoComplete="off"
                  value={newLocation?.coordinates[1] ?? ""}
                  onChange={handleCoordinateChange}
                />
                {coordinateErrors.lng && <p className="text-red-500">{coordinateErrors.lng}</p>}
              </div>
              <Button content="Find" type="submit" className="w-fit mx-auto" />
            </form>
          )
      )}

      {!minimal && activeVillage && (
        <div className="absolute bottom-0 m-5 p-5 text-white z-1000
           flex flex-col rounded-2xl"
        >
          <p
            style={{
              textShadow: "1px 1px 10px black"
            }}
            className="text-primary font-bold mb-1">
            {activeVillage.properties?.VILLAGE}
          </p>
          <p
            style={{
              textShadow: "1px 1px 10px black"
            }}
            className="text-sm text-gray-300">
            {activeVillage.properties?.DISTRICT}
          </p>
          <p
            style={{
              textShadow: "1px 1px 10px black"
            }}
            className="text-sm text-gray-300">
            {activeVillage.properties?.TALUK || "Unknown"}
          </p>
          <p
            style={{
              textShadow: "1px 1px 10px black"
            }}
            className="text-sm text-gray-300">
            {activeVillage.properties?.MAAGANE || "Unknown"}
          </p>
          {/* <Button content="View More" className="mx-auto text-sm" onClick={handleView} /> */}
        </div>
      )}

      <div ref={minimal ? undefined : ref} className="z-0 relative w-full h-full">
        <div className="z-10 absolute flex flex-col justify-center items-center gap-2 left-7 top-20 -translate-x-1/2 -translate-y-1/2 cursor-pointer">
          <div className={`flex h-14 flex-col gap-2 bg-slate-100 rounded-md ${lock ? "pointer-events-none" : ""}`}>
            <div className="h-1/2 p-1 pl-2 pr-2" onClick={() => handleZoomChange(1)}>
              <FaPlus className={`${lock ? "text-slate-300" : "text-black"}`} />
            </div>
            <div className="h-1/2 p-1 pl-2 pr-2" onClick={() => handleZoomChange(-1)}>
              <FaMinus className={`${lock ? "text-slate-300" : "text-black"}`} />
            </div>
          </div>
          <IoLocationSharp
            className={`${lock ? "text-slate-300 pointer-events-none" : "text-red-500"}`}
            size={32}
            onClick={() => map && map.setView(MAP_CENTER, MAP_INITIAL_ZOOM, { animate: true })}
          />

          {lock ? (
            <FaLock
              className="text-slate-500"
              size={24}
              onClick={() => setLock(false)}
            />
          ) : (
            <FaLockOpen
              className="text-slate-500"
              size={24}
              onClick={() => setLock(true)}
            />
          )}
        </div>

        <MapContainer
          className="z-0 relative w-full h-full"
          center={MAP_CENTER}
          zoom={MAP_INITIAL_ZOOM}
          maxBounds={MAP_MAX_BOUNDS}
          minZoom={MAP_MIN_ZOOM}
          scrollWheelZoom={false}
          zoomControl={false}
          doubleClickZoom={false}
          touchZoom={true}
        >
          <MapEvents />

          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            attribution="&copy; <a class='pr-2' target='_blank' href='https://www.esri.com/'>Esri</a>"
          />

          {geoJsonData?.districts && (
            <GeoJSON
              data={geoJsonData.districts}
              style={{ color: "var(--primary)", fillColor: "transparent", opacity: 0.5 }}
            />
          )}

          {
            !minimal && zoom >= 11 && (
              zoom > 15 ?
                uninteractiveVillageLayers
                :
                villageLayers
          )}

          {
            !minimal && editMode !== undefined && state?.location && validateLocationFields(state.location as ILocation) &&
              <Marker
                eventHandlers={{
                  mouseover: () => handleMarkerHover(state?.location as ILocation)
                }}
                position={[
                  activeLocation?.coordinates?.[0] || newLocation?.coordinates?.[0], 
                  activeLocation?.coordinates?.[1] || newLocation?.coordinates?.[1]
                ]}
              />
          }
          {
            !minimal && activeVillage && zoom >= 14 && existingLocations?.length > 0 && (
              existingLocations.filter(loc => loc.village === activeVillage.properties?.VILLAGE).map(loc => (
                <Marker
                  key={loc.id}
                  ref={(el) => {
                    if(el) {
                      markers.current[loc.name] = el;
                    } 
                  }}
                  position={[
                    loc.coordinates?.[0],
                    loc.coordinates?.[1]
                  ]}
                  eventHandlers={{
                    mouseover: () => handleMarkerHover(loc),
                    mouseout: () => handleMarkerOut(loc),
                    mousedown: (e) => handleMarkerClick(e, loc)
                  }}
                  icon={
                    orangeMarker
                  }
                />
              ))
            )
          }

          {React.Children.toArray(children)}
        </MapContainer>
      </div>

    </div>
  );
};

export default MAP;