import {useEffect} from "react";
import {Page, Table} from "@myapp/ui";
import {useUserStore} from "~/stores/userStore";

function Home() {
  const {users, fetchUsers} = useUserStore();

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return (
    <Page id="page-1" className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Users List</h1>

      <div className="overflow-x-auto shadow-md rounded-lg bg-white">
        <Table
          items={users}
          emptyMessage="No users found."
          className="min-w-full divide-y divide-gray-200"
          columns={[
            {
              header: "ID",
              render: (user) => (
                <span className="text-sm font-medium text-gray-700">
                  {user.id}
                </span>
              ),
            },
            {
              header: "Name",
              render: (user) => (
                <span className="text-sm text-gray-800">{user.name}</span>
              ),
            },
          ]}
        />
      </div>
    </Page>
  );
}

export default Home;
