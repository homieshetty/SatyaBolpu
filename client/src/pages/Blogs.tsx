import CardList from "../components/CardList";
import BlogCard, { BlogCardProps, BlogSkeletonCard } from "../components/BlogCard";
import Title from "../components/Title";

const Blogs = () => {
  return (
    <div className="w-full min-h-screen py-20">
      <Title title="Blogs" />
      <CardList<BlogCardProps>
        Card={BlogCard}
        SkeletonCard={BlogSkeletonCard}
        cardsPerPage={10}
        apiEndpoint="blogs"
        dataKey="blogs"
        orientation="column"
        sortOptions={{
          "Title": "title",
          "Date": "createdAt"
        }}
      />
    </div>
  );
};

export default Blogs;
