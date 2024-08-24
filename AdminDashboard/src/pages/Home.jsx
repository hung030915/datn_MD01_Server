import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import "./home.css";
import Cookies from "js-cookie";
import { Card, Col, Flex, Row, Statistic, Table, Typography } from "antd";
import CountUp from "react-countup";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const formatter = (value) => <CountUp end={value} separator="," />;
const Home = () => {
  const token = Cookies.get("token");

  const dataUser = useSelector((state) => state.customerReducer.data);
  const dataStore = useSelector((state) => state.storeReducer.data);
  const dataProduct = useSelector((state) => state.productReducer.data);
  const loadingProduct = useSelector((state) => state.productReducer.loading);
  const loadingStore = useSelector((state) => state.storeReducer.loading);
  const loadingUser = useSelector((state) => state.customerReducer.loading);
  const [top5Product, setTop5Product] = useState(null);
  const [loadingTop5Product, setLoadingTop5Product] = useState(false);
  // const [topStore, setTopStore] = useState(null);
  // const [loadingTopStore, setLoadingTopStore] = useState(false);

  useEffect(() => {
    setLoadingTop5Product(true);
    axios
      .get(
        `${import.meta.env.VITE_BASE_URL}statistical/get-top-product-by-revenue`
      )
      .then((response) => {
        setLoadingTop5Product(false);
        setTop5Product(response.data);
      })
      .catch((e) => {
        setLoadingTop5Product(false);
        console.log(e);
      });
  }, []);

  // useEffect(() => {
  //   setLoadingTopStore(true);
  //   axios
  //     .get(
  //       `${import.meta.env.VITE_BASE_URL}statistical/get-top-store-by-revenue`
  //     )
  //     .then((response) => {
  //       setLoadingTopStore(false);
  //       setTopStore(response.data);
  //     })
  //     .catch((e) => {
  //       setLoadingTopStore(false);
  //       console.log(e);
  //     });
  // }, []);

  const columns = [
    {
      title: "STT",
      dataIndex: "index",
      key: "index",
      render: (text, record, index) => index + 1,
      width: 50,
    },
    {
      title: "Tên sản phẩm",
      dataIndex: "productName",
      key: "name",
    },
    {
      title: "username",
      dataIndex: "productImage",
      key: "productImage",
      render: (text) => <img src={text} className="w-16" />,
    },
    {
      title: "Tổng doanh thu",
      dataIndex: "totalRevenue",
      key: "totalRevenue",
      render: (text) => (
        <Typography>
          {text ? text.toLocaleString("vi-VN") + " đ" : ""}
        </Typography>
      ),
    },
  ];

  return (
    <div>
      <Flex vertical={false}>
        <Card bordered size="default" className="shadow-md  m-3">
          <Statistic
            title="Người dùng kích hoạt"
            value={dataUser ? dataUser?.result.length : 0}
            formatter={formatter}
            loading={loadingUser}
          />
        </Card>
        {/* <Card bordered size="default" className="shadow-md m-3">
          <Statistic
            title="Cửa hàng kích hoạt"
            value={dataStore ? dataStore?.data.length : 0}
            formatter={formatter}
            loading={loadingStore}
          />
        </Card> */}
        <Card bordered size="default" className="shadow-md  m-3">
          <Statistic
            title="Sản phẩm hiện có"
            value={dataProduct ? dataProduct?.result.length : 0}
            formatter={formatter}
            loading={loadingProduct}
          />
        </Card>
      </Flex>
      <div>
        <Row>
          <Col span={12} className="">
            <div className="flex flex-col border rounded-md shadow-lg m-3">
              <div className="p-2 px-5">
                <Typography.Title level={4} style={{ marginBottom: 0 }}>
                  Top sản phẩm bán chạy nhất tháng
                </Typography.Title>
              </div>
              <Table
                pagination={false}
                dataSource={top5Product?.data}
                columns={columns}
                rowKey={(record) => record._id}
                loading={loadingTop5Product}
              />
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default Home;

// const BarChart = ({ data }) => {
//   const chartData = {
//     labels: data?.map((entry) => entry.storeName),
//     datasets: [
//       {
//         label: "Doanh thu",
//         backgroundColor: "#407cff",
//         borderColor: "#407cff",
//         borderWidth: 1,
//         data: data?.map((entry) => entry.totalRevenue),
//         barThickness: 35,
//       },
//     ],
//   };

//   return <Bar data={chartData} />;
// };
