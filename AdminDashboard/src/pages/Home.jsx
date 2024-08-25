import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import "./home.css";
import Cookies from "js-cookie";
import {
  DatePicker,
  Button,
  Card,
  Col,
  Flex,
  Row,
  Statistic,
  Space,
  Table,
  Typography,
} from "antd";
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
  const [selectedFilter, setSelectedFilter] = useState({
    type: "all",
    value: null,
  });

  const [statisticRevenue, setStatisticRevenue] = useState([]);
  const [loadingStatisticRevenue, setLoadingStatisticRevenue] = useState(false);
  const [selectedRevenueFilter, setSelectedRevenueFilter] = useState("month");
  const [dateRange, setDateRange] = useState(null);

  useEffect(() => {
    fetchTop5ProductData();
  }, [selectedFilter]);

  useEffect(() => {
    fetchStatisticRevenueData();
  }, [selectedRevenueFilter, dateRange]);

  const fetchTop5ProductData = () => {
    setLoadingTop5Product(true);
    let url = `${
      import.meta.env.VITE_BASE_URL
    }statistical/get-top-product-by-revenue`;
    if (selectedFilter.type && selectedFilter.type !== "all") {
      url += `?sort=${selectedFilter.type}`;
    }
    axios
      .get(url)
      .then((response) => {
        setLoadingTop5Product(false);
        setTop5Product(response.data);
      })
      .catch((e) => {
        setLoadingTop5Product(false);
        console.log(e);
      });
  };

  const fetchStatisticRevenueData = () => {
    setLoadingStatisticRevenue(true);
    let url = `${import.meta.env.VITE_BASE_URL}statistical/revenue`;

    let params = {};
    if (dateRange) {
      params.startDate = dateRange[0].format("YYYY-MM-DD");
      params.endDate = dateRange[1].format("YYYY-MM-DD");
    } else {
      params.type = selectedRevenueFilter;
    }

    axios
      .get(url, { params })
      .then((response) => {
        setLoadingStatisticRevenue(false);
        setStatisticRevenue(response.data);
      })
      .catch((e) => {
        setLoadingStatisticRevenue(false);
        console.log(e);
      });
  };
  const handleFilterChange = (type, value) => {
    setSelectedFilter({ type, value });
  };

  const handleDateRangeChange = (dates) => {
    setDateRange(dates);
    setSelectedRevenueFilter(null);
  };

  const prepareChartData = (data) => {
    if (!data || data.length === 0) {
      return {
        labels: [],
        datasets: [
          {
            label: "Doanh thu",
            data: [],
            backgroundColor: "rgba(54, 162, 235, 0.6)",
            borderColor: "rgba(54, 162, 235, 1)",
            borderWidth: 1,
          },
        ],
      };
    }

    const formatDate = (date) => {
      if (dateRange) {
        return date; // Giữ nguyên định dạng từ API khi chọn khoảng ngày
      }
      switch (selectedRevenueFilter) {
        case "day":
          return date; // Assuming date is already in "DD/MM" format
        case "month":
          return date; // Assuming date is already in "DD/MM" format
        case "year":
          return `Tháng ${date}`; // For year view, date should be month number
        default:
          return date;
      }
    };

    return {
      labels: data.map((item) => formatDate(item.date)),
      datasets: [
        {
          label: "Doanh thu",
          data: data.map((item) => item.totalRevenue),
          backgroundColor: "rgba(54, 162, 235, 0.6)",
          borderColor: "rgba(54, 162, 235, 1)",
          borderWidth: 1,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Biểu đồ doanh thu",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Doanh thu (VNĐ)",
        },
        ticks: {
          callback: function (value) {
            return value.toLocaleString("vi-VN") + " đ";
          },
        },
      },
    },
  };

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
      title: "tên sản phẩm",
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
    {
      title: "tổng số bán ra",
      dataIndex: "totalQuantitySold",
      key: "totalQuantitySold",
    },
  ];

  return (
    <div>
      <Flex vertical={false}>
        <Card bordered size="default" className="shadow-md  m-3">
          <Statistic
            title="Người dùng kích hoạt"
            value={dataUser ? dataUser?.result.length : 0}
            formatter={(value) => <CountUp end={value} separator="," />}
            loading={loadingUser}
          />
        </Card>
        <Card bordered size="default" className="shadow-md  m-3">
          <Statistic
            title="Sản phẩm hiện có"
            value={dataProduct ? dataProduct?.result.length : 0}
            formatter={(value) => <CountUp end={value} separator="," />}
            loading={loadingProduct}
          />
        </Card>
      </Flex>
      <div className="flex flex-col border rounded-md shadow-lg m-3">
        <Typography.Title
          level={4}
          style={{ marginBottom: 0, padding: "16px" }}
        >
          Tổng doanh thu
        </Typography.Title>
        <Space style={{ marginTop: 16, padding: "16px" }}>
          <Button
            type={
              selectedRevenueFilter === "day" && !dateRange
                ? "primary"
                : "default"
            }
            onClick={() => {
              setSelectedRevenueFilter("day");
              setDateRange(null);
            }}
          >
            Ngày
          </Button>
          <Button
            type={
              selectedRevenueFilter === "month" && !dateRange
                ? "primary"
                : "default"
            }
            onClick={() => {
              setSelectedRevenueFilter("month");
              setDateRange(null);
            }}
          >
            Tháng
          </Button>
          <Button
            type={
              selectedRevenueFilter === "year" && !dateRange
                ? "primary"
                : "default"
            }
            onClick={() => {
              setSelectedRevenueFilter("year");
              setDateRange(null);
            }}
          >
            Năm
          </Button>
          <DatePicker.RangePicker
            value={dateRange}
            onChange={handleDateRangeChange}
            style={{ marginLeft: "16px" }}
          />
        </Space>
        <div style={{ height: "400px", padding: "16px" }}>
          <Bar
            data={prepareChartData(statisticRevenue)}
            options={chartOptions}
          />
        </div>
      </div>
      <div className="flex flex-col border rounded-md shadow-lg m-3">
        <div className="p-2 px-5">
          <Typography.Title level={4} style={{ marginBottom: 0 }}>
            Top 5 sản phẩm bán chạy nhất
          </Typography.Title>
          <Space style={{ marginBottom: 16 }}>
            <Button
              type={selectedFilter.type === "all" ? "primary" : "default"}
              onClick={() => handleFilterChange("all", null)}
            >
              Tất cả
            </Button>
            <Button
              type={selectedFilter.type === "day" ? "primary" : "default"}
              onClick={() => handleFilterChange("day", null)}
            >
              Ngày
            </Button>
            <Button
              type={selectedFilter.type === "month" ? "primary" : "default"}
              onClick={() => handleFilterChange("month", null)}
            >
              Tháng
            </Button>
            <Button
              type={selectedFilter.type === "year" ? "primary" : "default"}
              onClick={() => handleFilterChange("year", null)}
            >
              Năm
            </Button>
          </Space>
        </div>
        <Table
          pagination={false}
          dataSource={top5Product?.data}
          columns={columns}
          rowKey={(record) => record._id}
          loading={loadingTop5Product}
        />
      </div>
    </div>
  );
};

export default Home;
