import CardList from "../components/CardList";
import { CollapsingCard, CollapsingSkeletonCard } from "../components/CollapsingCard";
import Title from "../components/Title";
import { CollapsingCardProps } from "../types/globals";

const Events = () => {
  return (
    <div
      className="w-full py-20"
    >
      <Title 
        title="Events"
      />
      <CardList<CollapsingCardProps> 
        Card={CollapsingCard}
        SkeletonCard={CollapsingSkeletonCard}
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