const catchAsync = require("../utils/catchAsync");
const httpStatus = require("http-status");
const { packageService } = require("../services");

const createPackage = catchAsync(async (req, res) => {
  const pack = await packageService.createPackage(req.body);
  res.status(httpStatus.CREATED).send(pack);
});

const getAllPackages = catchAsync(async (req, res) => {
  const packages = await packageService.getAllPackages();
  res.send(packages);
});

const getPackageById = catchAsync(async (req, res) => {
  const pack = await packageService.getPackageById(+req.params.packageId);
  res.send(pack);
});

const updatePackage = catchAsync(async (req, res) => {
  const updated = await packageService.updatePackage(+req.params.packageId, req.body);
  res.send(updated);
});

const deletePackage = catchAsync(async (req, res) => {
  await packageService.deletePackage(+req.params.packageId);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createPackage,
  getAllPackages,
  getPackageById,
  updatePackage,
  deletePackage,
};
