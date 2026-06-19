import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Title from '../../components/Title';
import CardList from '../../components/CardList';
import useApi from '../../hooks/useApi';
import DraftCard, {
  DraftCardProps,
  DraftSkeletonCard,
} from '../../components/DraftCard';

const Drafts = () => {
  const { state: authState } = useAuth();
  const draftsApi = useApi('/drafts');
  const navigate = useNavigate();

  const handleEdit = async (id: string) => {
    const res = await draftsApi.refetch({
      endpoint: `/drafts/${id}`,
      method: 'GET',
    });
    if (!res) return;
    navigate(`/create/${res.type.toLowerCase()}/${id}`);
  };

  const handleDelete = async (id: string) => {
    await draftsApi.del({ endpoint: `/drafts/${id}` });
  };

  if (!authState.token || !authState.user) {
    return <Navigate to={'/404'} replace />;
  }

  return (
    <div className="py-20 flex flex-col items-center justify-center">
      <Title title="Drafts" />

      <CardList<DraftCardProps>
        Card={DraftCard}
        SkeletonCard={DraftSkeletonCard}
        handleEdit={handleEdit}
        handleDelete={handleDelete}
        apiEndpoint="drafts"
        dataKey="drafts"
        orientation="column"
        pagination={false}
        searchBar={false}
      />
    </div>
  );
};

export default Drafts;
