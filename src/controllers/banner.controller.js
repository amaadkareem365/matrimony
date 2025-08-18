const httpStatus = require("http-status");
const catchAsync = require("../utils/catchAsync");
const bannerService = require("../services/banner.service");

const createBanner = catchAsync(async (req, res) => {
  const banner = await bannerService.createBanner(req.body);
  res.status(httpStatus.CREATED).send(banner);
});

const getAllBanners = catchAsync(async (req, res) => {
  const banners = await bannerService.getAllBanners();
  res.send(banners);
});

const getBanner = catchAsync(async (req, res) => {
  const banner = await bannerService.getBanner(req.params.id);
  res.send(banner);
});

const updateBanner = catchAsync(async (req, res) => {
  const banner = await bannerService.updateBanner(req.params.id, req.body);
  res.send(banner);
});

const deleteBanner = catchAsync(async (req, res) => {
  await bannerService.deleteBanner(req.params.id);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createBanner,
  getAllBanners,
  getBanner,
  updateBanner,
  deleteBanner,
};
