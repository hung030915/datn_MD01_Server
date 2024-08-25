import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button, Space, Table, Typography } from "antd";

const ProductsChart = () => {
  const [loadingProduct, setLoadingProduct] = useState(false);
  const [product, setProduct] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState({
    type: "all",
    value: null,
  });

  useEffect(() => {
    fetchProductData();
  }, [selectedFilter]);

  const fetchProductData = () => {
    setLoadingProduct(true);
    let url = `${
      import.meta.env.VITE_BASE_URL
    }statistical/get-all-products-statistics`;
    if (selectedFilter.type && selectedFilter.type !== "all") {
      url += `?sort=${selectedFilter.type}`;
    }
    axios
      .get(url)
      .then((response) => {
        setLoadingProduct(false);
        setProduct(response.data);
      })
      .catch((e) => {
        setLoadingProduct(false);
        console.log(e);
      });
  };

  const handleFilterChange = (type, value) => {
    setSelectedFilter({ type, value });
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
      dataIndex: "totalQuantitySold",
      key: "totalQuantitySold",
    },
    {
      title: "Tổng doanh thu",
      dataIndex: "totalRevenue",
      key: "totalRevenue",
      render: (text) => (
        <Typography>{text.toLocaleString("vi-VN") + " đ"}</Typography>
      ),
    },
    {
      title: "Tổng sao",
      dataIndex: "totalRates",
      key: "totalRates",
    },
  ];

  return (
    <div>
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
      <Table
        pagination={false}
        dataSource={product?.data}
        columns={columns}
        rowKey={(record) => record._id}
        loading={loadingProduct}
      />
    </div>
  );
};

export default ProductsChart;
