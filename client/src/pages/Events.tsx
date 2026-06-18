import CardList from "../components/CardList";
import EventCard, { EventCardProps, EventSkeletonCard } from "../components/EventCard";
import Title from "../components/Title";

const Events = () => {
  return (
    <div
      className="w-full py-20"
    >
      <Title 
        title="Events"
      />
      <CardList<EventCardProps> 
        Card={EventCard}
        SkeletonCard={EventSkeletonCard}
        cardsPerPage={10}
        apiEndpoint="events"
        dataKey="events"
        orientation="row"
        sortOptions={{
          "Name": "title"
        }}
      />
    </div>
  );
}

export default Events;