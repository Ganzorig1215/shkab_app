import React, { useState, useEffect } from "react";
import { List, Button, message, Modal, Pagination, notification } from "antd";
import axios from "axios";
import { useParams, useNavigate, Navigate } from "react-router-dom";

const AddAdmin1 = () => {
  const { id } = useParams();
  const [users, setUsers] = useState([]);
  const [user, setUser] = useState({
    name: "",
    role: "",
  });
  const [selectedUser, setSelectedUser] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const Navigate = useNavigate();
  useEffect(() => {
    const fetchUsers = async () => {
      const apiUrl = `${process.env.REACT_APP_BASE_URL}/registration`;
      console.log(apiUrl);
      try {
        const response = await axios.get(apiUrl);
        setUsers(response.data.data);
      } catch (error) {
        console.error("Failed to fetch users", error);
      }
    };

    fetchUsers();
  }, []);

  // const data = users[0].id;
  // console.log(data);
  const handleAddAdmin = () => {
    const userId = users[0].id;
    const apiUrl = `${process.env.REACT_APP_BASE_URL}/addAdmin/${userId}`;

    axios
      .put(apiUrl)
      .then((res) => {
        notification.success({ message: res.data.message });
        setIsModalOpen(false);
        setUsers((prevUsers) =>
          prevUsers.map((u) =>
            u.id === selectedUser.id ? { ...u, role: "admin" } : u
          )
        );
      })
      .catch((error) => {
        console.error("Failed to add admin", error);
      });
  };
  const [isModalOpen, setIsModalOpen] = useState(false);
  const showModal = () => {
    setIsModalOpen(true);
  };
  const handleOk = () => {
    setIsModalOpen(false);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedUsers = users.slice(startIndex, endIndex);
  return (
    <div>
      <h2>Бүртүүлсэн хэрэглэгчдийн лист</h2>
      <List
        dataSource={paginatedUsers}
        renderItem={(user) => (
          <List.Item key={user.id}>
            <List.Item.Meta title={user.name} description={user.email} />
            <Button
              type="primary"
              onClick={() => {
                setUser({
                  role: user.role,
                  name: user.name,
                });
                showModal(user);
              }}
            >
              Add Admin
            </Button>
            <Button type="danger" onClick={() => showRemoveModal(user)}>
              Remove Admin
            </Button>
          </List.Item>
        )}
      />
      <>
        <Modal
          title="Add Admin"
          visible={isModalOpen}
          onOk={handleAddAdmin} // Change to handleAddAdmin
          onCancel={handleCancel}
        >
          <p>{`Хэрэглэгч: ${user?.name}`}</p>
          <p>{`Одоогийн эрх: ${user?.role}`}</p>
          <p>Та админ эрх нэмэхийг хүсэж байна уу?</p>
        </Modal>
      </>
      <Pagination
        current={currentPage}
        pageSize={itemsPerPage}
        total={users.length}
        onChange={(page) => setCurrentPage(page)}
        showSizeChanger={false}
      />
    </div>
  );
};

export default AddAdmin1;
