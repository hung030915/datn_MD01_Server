const db = require("../config/ConnectDB");
const optionModel = require("../models/Option");
const orderModel = require("../models/Orders");
const productModel = require("../models/Products");

const calculateRevenueAllTime = async (req, res, next) => {
  try {
    // Extract store_id and month from the request
    const { store_id } = req.query;

    const revenue = await orderModel.order.aggregate([
      {
        $match: {
          "status": "Đã giao hàng",
        },
      },
      {
        $lookup: {
          from: "options",
          localField: "productsOrder.option_id",
          foreignField: "_id",
          as: "order_options",
        },
      },
      {
        $unwind: "$order_options",
      },
      {
        $lookup: {
          from: "products",
          localField: "order_options.product_id",
          foreignField: "_id",
          as: "product",
        },
      },
      {
        $unwind: "$product",
      },
      {
        $match: {
          "product.store_id": new db.mongoose.Types.ObjectId(store_id),
        },
      },
      {
        $group: {
          _id: store_id,
          totalRevenue: { $sum: "$total_price" },
        },
      },
    ]);

    const totalRevenue = revenue.length > 0 ? revenue[0].totalRevenue : 0;

    return res.status(200).json({
      code: 200,
      message: `Tất cả doanh thu của cửa hàng`,
      data: totalRevenue,
    });
  } catch (error) {
    return res.status(500).json({ code: 500, message: error.message });
  }
};

const calculateRevenueByMonth = async (req, res, next) => {
  try {
    // Extract store_id and month from the request
    const { store_id, month } = req.query;
    const currentYear = new Date().getFullYear();//năm hiện tại
    const revenueByMonth = await orderModel.order.aggregate([
      {
        $match: {
          "status": "Đã giao hàng",
          "createdAt": {
            $gte: new Date(`${currentYear}-${month}-01T00:00:00.000Z`),
            $lt: new Date(`${currentYear}-${month}-31T23:59:59.999Z`),
          }
        },
      },
      {
        $lookup: {
          from: "options",
          localField: "productsOrder.option_id",
          foreignField: "_id",
          as: "order_options",
        },
      },
      {
        $unwind: "$order_options",
      },
      {
        $lookup: {
          from: "products",
          localField: "order_options.product_id",
          foreignField: "_id",
          as: "product",
        },
      },
      {
        $unwind: "$product",
      },
      {
        $match: {
          "product.store_id": new db.mongoose.Types.ObjectId(store_id),
        },
      },
      {
        $group: {
          _id: store_id,
          totalRevenue: { $sum: "$total_price" },
        },
      },
    ]);

    const totalRevenue = revenueByMonth.length > 0 ? revenueByMonth[0].totalRevenue : 0;

    return res.status(200).json({
      code: 200,
      message: `Doanh thu của cửa hàng tháng ${month}`,
      data: totalRevenue,
    });
  } catch (error) {
    return res.status(500).json({ code: 500, message: error.message });
  }
};

const calculateSoldQuantityByProductAndStore = async (req, res, next) => {
  try {
    const { store_id } = req.query;

    const soldQuantityByProductAndStore = await orderModel.order.aggregate([
      {
        $match: {
          "status": "Đã giao hàng",
        },
      },
      {
        $unwind: "$productsOrder",
      },
      {
        $lookup: {
          from: "options",
          localField: "productsOrder.option_id",
          foreignField: "_id",
          as: "order_options",
        },
      },
      {
        $unwind: "$order_options",
      },
      {
        $lookup: {
          from: "products",
          localField: "order_options.product_id",
          foreignField: "_id",
          as: "product_info",
        },
      },
      {
        $unwind: "$product_info",
      },
      {
        $match: {
          "product_info.store_id": new db.mongoose.Types.ObjectId(store_id),
        },
      },
      {
        $group: {
          _id: {
            product_id: "$product_info._id",
            store_id: "$product_info.store_id",
          },
          totalSoldQuantity: { $sum: "$productsOrder.quantity" },
          productDetails: { $first: "$product_info" },
          productImages: { $push: "$order_options.image" }, // Lấy danh sách link ảnh sản phẩm
        },
      },
      {
        $project: {
          _id: 0,
          product_id: "$_id.product_id",
          store_id: "$_id.store_id",
          totalSoldQuantity: "$totalSoldQuantity",
          productDetails: {
            name: "$productDetails.name",
            image: { $arrayElemAt: ["$productImages", 0] }, // Lấy link ảnh đầu tiên
            // Thêm các trường khác nếu cần
          },
        },
      },
    ]).sort({ totalSoldQuantity: -1 });

    return res.status(200).json({
      code: 200,
      message: "Thống kê số lượng sản phẩm đã bán",
      data: soldQuantityByProductAndStore,
    });
  } catch (error) {
    return res.status(500).json({ code: 500, message: error.message });
  }
};


const getTopStoreByRevenue = async (req, res, next) => {
  try {
    const top5Stores = await orderModel.order.aggregate([
      {
        $match: {
          status: 'Đã giao hàng',
        },
      },
      {
        $unwind: '$productsOrder',
      },
      {
        $lookup: {
          from: 'options', // Tên bảng option trong mô hình của bạn
          localField: 'productsOrder.option_id',
          foreignField: '_id',
          as: 'optionInfo',
        },
      },
      {
        $unwind: '$optionInfo',
      },
      {
        $lookup: {
          from: 'products', // Tên bảng product trong mô hình của bạn
          localField: 'optionInfo.product_id',
          foreignField: '_id',
          as: 'productInfo',
        },
      },
      {
        $unwind: '$productInfo',
      },
      {
        $lookup: {
          from: 'stores', // Tên bảng store trong mô hình của bạn
          localField: 'productInfo.store_id',
          foreignField: '_id',
          as: 'storeInfo',
        },
      },
      {
        $unwind: '$storeInfo',
      },
      {
        $group: {
          _id: '$storeInfo._id',
          storeName: { $first: '$storeInfo.name' },
          totalRevenue: { $sum: '$total_price' },
        },
      },
      {
        $project: {
          store_id: '$_id',
          storeName: 1,
          totalRevenue: 1,
        },
      },
      {
        $sort: { totalRevenue: -1 },
      },
      {
        $limit: 5,
      },
    ]);

    return res.status(200).json({
      code: 200,
      message: "Top 5 cửa hàng có doanh thu cao nhất!",
      data: top5Stores,
    });
  } catch (error) {
    return res.status(500).json({ code: 500, message: error.message });
  }
}

const getTopProductByRevenue = async (req, res, next) => {
  try {
    const { sort } = req.query;

    // Get current date and determine the date range based on the sort parameter
    const now = new Date();
    let matchStage = { status: 'Đã giao hàng' };

    if (sort === 'day') {
      matchStage.createdAt = { $gte: new Date(now.setHours(0, 0, 0, 0)) };
    } else if (sort === 'month') {
      matchStage.createdAt = {
        $gte: new Date(now.getFullYear(), now.getMonth(), 1),
      };
    } else if (sort === 'year') {
      matchStage.createdAt = {
        $gte: new Date(now.getFullYear(), 0, 1),
      };
    }

    const top5Products = await orderModel.order.aggregate([
      {
        $match: matchStage,
      },
      {
        $unwind: '$productsOrder',
      },
      {
        $lookup: {
          from: 'options',
          localField: 'productsOrder.option_id',
          foreignField: '_id',
          as: 'optionInfo',
        },
      },
      {
        $unwind: '$optionInfo',
      },
      {
        $lookup: {
          from: 'products',
          localField: 'optionInfo.product_id',
          foreignField: '_id',
          as: 'productInfo',
        },
      },
      {
        $unwind: '$productInfo',
      },
      {
        $group: {
          _id: '$productInfo._id',
          productName: { $first: '$productInfo.name' },
          totalRevenue: { $sum: '$total_price' },
          productImage: { $first: '$optionInfo.image' },
          totalQuantitySold: { $sum: '$productsOrder.quantity' },
        },
      },
      {
        $project: {
          product_id: '$_id',
          productName: 1,
          totalRevenue: 1,
          productImage: 1,
          totalQuantitySold: 1,
        },
      },
      {
        $sort: { totalRevenue: -1 },
      },
      {
        $limit: 5,
      },
    ]);

    return res.status(200).json({
      code: 200,
      message: "Top 5 sản phẩm có doanh thu cao nhất!",
      data: top5Products,
    });
  } catch (error) {
    return res.status(500).json({ code: 500, message: error.message });
  }
};

// 2023-11-29T16:15:29.307+00:00

const getTotalRevenueByTimePeriodAndStatus = async (year, month, quarter) => {
  try {
    const matchStage = {
      $match: {
        status: "Đã giao hàng",
        createdAt: {
          $gte: new Date(year, month - 1, 1),
          $lt: new Date(year, month, 0),
        },
      },
    };

    if (quarter) {
      matchStage.$match.createdAt.$gte = new Date(year, (quarter - 1) * 3, 1);
      matchStage.$match.createdAt.$lt = new Date(year, (quarter - 1) * 3 + 3, 31);
    }

    const result = await orderModel.order.aggregate([
      matchStage,
      {
        $unwind: "$productsOrder",
      },
      {
        $lookup: {
          from: "options",
          localField: "productsOrder.option_id",
          foreignField: "_id",
          as: "optionInfo",
        },
      },
      {
        $unwind: "$optionInfo",
      },
      {
        $lookup: {
          from: "products",
          localField: "optionInfo.product_id",
          foreignField: "_id",
          as: "productInfo",
        },
      },
      {
        $unwind: "$productInfo",
      },
      {
        $lookup: {
          from: "stores",
          localField: "productInfo.store_id",
          foreignField: "_id",
          as: "storeInfo",
        },
      },
      {
        $unwind: "$storeInfo",
      },
      {
        $group: {
          _id: "$storeInfo._id",
          storeName: { $first: "$storeInfo.name" },
          totalRevenue: { $sum: { $ifNull: ["$total_price", 0] } },
        },
      },
      {
        $sort: { totalRevenue: -1 } 
      }
    ]);

    return result;
  } catch (error) {
    console.error("Error fetching total revenue with store info:", error);
    throw error;
  }
};

const revenueAllStoreByMonth = async (req, res, next) => {
  const currentYear = new Date().getFullYear();
  const { month } = req.query;
  try {
    const result = await getTotalRevenueByTimePeriodAndStatus(currentYear, month);
    console.log('result: ', result);

    if (result === null || result.length === 0) {
      return res.status(200).json({
        code: 200,
        message: `Không có doanh thu của store nào trong tháng ${month} `,
        data: result
      });
    }

    return res.status(200).json({
      code: 200,
      message: `Doanh thu các store theo tháng ${month} năm ${currentYear}`,
      data: result
    });
  } catch (error) {
    return res.status(500).json({ code: 500, message: error.message });
  }
}

const revenueAllStoreByQuarter = async (req, res, next) => {
  const currentYear = new Date().getFullYear();
  const { quarter } = req.query;
  try {
    const result = await getTotalRevenueByTimePeriodAndStatus(currentYear, null, quarter);
    console.log('result: ', result);

    if (result === null || result.length === 0) {
      return res.status(200).json({
        code: 200,
        message: `Không có doanh thu theo quí ${quarter}.`,
        data: result
      });
    }

    return res.status(200).json({
      code: 200,
      message: `Doanh thu các store theo quý thứ ${quarter}`,
      data: result
    });
  } catch (error) {
    return res.status(500).json({ code: 500, message: error.message });
  }
}
const getAllProductsStatistics = async (req, res, next) => {
  try {
    const { sort } = req.query;

    // Get current date
    const now = new Date();
    let matchCondition = {};

    // Set match conditions based on sort type
    if (sort === 'day') {
      matchCondition = {
        $expr: {
          $and: [
            { $eq: [{ $dayOfMonth: '$orders.createdAt' }, { $dayOfMonth: now }] },
            { $eq: [{ $month: '$orders.createdAt' }, { $month: now }] },
            { $eq: [{ $year: '$orders.createdAt' }, { $year: now }] }
          ]
        }
      };
    } else if (sort === 'month') {
      matchCondition = {
        $expr: {
          $and: [
            { $eq: [{ $month: '$orders.createdAt' }, { $month: now }] },
            { $eq: [{ $year: '$orders.createdAt' }, { $year: now }] }
          ]
        }
      };
    } else if (sort === 'year') {
      matchCondition = {
        $expr: { $eq: [{ $year: '$orders.createdAt' }, { $year: now }] }
      };
    }

    const productStatistics = await productModel.product.aggregate([
      // Lookup and unwind stages...
      {
        $lookup: {
          from: 'options',
          localField: '_id',
          foreignField: 'product_id',
          as: 'options',
        },
      },
      {
        $unwind: {
          path: '$options',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'orders',
          localField: 'options._id',
          foreignField: 'productsOrder.option_id',
          as: 'orders',
        },
      },
      {
        $unwind: {
          path: '$orders',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: '$orders.productsOrder',
          preserveNullAndEmptyArrays: true,
        },
      },
      // Apply the match condition based on sort type
      {
        $match: {
          $or: [
            {
              $and: [
                matchCondition,
                { 'orders.status': 'Đã giao hàng' },
              ]
            },
            { 'orders': { $exists: false } }, // Include products with no orders
          ],
        },
      },
      // Group, project, and sort stages...
      {
        $group: {
          _id: '$_id',
          productName: { $first: '$name' },
          totalQuantitySold: { $sum: { $cond: ['$orders.productsOrder.quantity', '$orders.productsOrder.quantity', 0] } },
          totalRevenue: { $sum: { $cond: ['$orders.total_price', '$orders.total_price', 0] } },
          totalRates: { $first: { $size: '$product_review' } },
        },
      },
      {
        $project: {
          product_id: '$_id',
          productName: 1,
          totalQuantitySold: 1,
          totalRevenue: 1,
          totalRates: 1,
        },
      },
      {
        $sort: { totalRevenue: -1 },
      },
    ]);

    return res.status(200).json({
      code: 200,
      message: "Thống kê tất cả sản phẩm!",
      data: productStatistics,
    });
  } catch (error) {
    return res.status(500).json({ code: 500, message: error.message });
  }
}

const getTotalRevenue = async (req, res) => {
  try {
    const { type, startDate, endDate } = req.query;
    let matchCondition = { status: "Đã giao hàng" };
    let groupCondition = {};
    let projectCondition = {};

    if (startDate && endDate) {
      // Nếu có startDate và endDate, xử lý theo khoảng thời gian
      matchCondition.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
      groupCondition = {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        totalRevenue: { $sum: "$total_price" },
      };
      projectCondition = {
        _id: 0,
        totalRevenue: 1,
        date: "$_id",
      };
    } else {
      // Xử lý theo type như trước
      switch (type) {
        case "day":
        case "month":
          groupCondition = {
            _id: type === "day" ? { $dayOfWeek: "$createdAt" } : { $dayOfMonth: "$createdAt" },
            date: { $first: "$createdAt" },
            totalRevenue: { $sum: "$total_price" },
          };
          projectCondition = {
            _id: 0,
            totalRevenue: 1,
            [type]: "$_id",
            date: { $dateToString: { format: "%d/%m", date: "$date" } },
          };
          break;
        case "year":
          groupCondition = {
            _id: { $month: "$createdAt" },
            totalRevenue: { $sum: "$total_price" },
          };
          projectCondition = {
            _id: 0,
            totalRevenue: 1,
            month: "$_id",
            date: {
              $let: {
                vars: {
                  monthsInVietnamese: [
                    "", "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
                    "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"
                  ]
                },
                in: { $arrayElemAt: ["$$monthsInVietnamese", "$_id"] }
              }
            },
          };
          break;
        default:
          return res.status(400).json({ error: "Invalid type parameter" });
      }
    }

    const revenue = await orderModel.order.aggregate([
      { $match: matchCondition },
      { $group: groupCondition },
      { $project: projectCondition },
      { $sort: { date: 1 } },
    ]);

    res.status(200).json(revenue);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  calculateRevenueAllTime,
  calculateRevenueByMonth,
  calculateSoldQuantityByProductAndStore,
  getTopStoreByRevenue,
  getTopProductByRevenue,
  revenueAllStoreByMonth,
  revenueAllStoreByQuarter,
  getAllProductsStatistics,
  getTotalRevenue
};
