const httpStatus = require("http-status");
const catchAsync = require("../utils/catchAsync");
const { profileAttributeService } = require("../services");

const create = catchAsync(async (req, res) => {
  const attribute = await profileAttributeService.create(req.body);
  res.status(httpStatus.CREATED).send(attribute);
});

const getAll = catchAsync(async (req, res) => {
  const list = await profileAttributeService.getAll();
  res.send(list);
});

const getById = catchAsync(async (req, res) => {
  const attribute = await profileAttributeService.getById(+req.params.id);
  res.send(attribute);
});

const update = catchAsync(async (req, res) => {
  const updated = await profileAttributeService.update(+req.params.id, req.body);
  res.send(updated);
});

const remove = catchAsync(async (req, res) => {
  await profileAttributeService.remove(+req.params.id);
  res.status(httpStatus.NO_CONTENT).send();
});

const addOption = catchAsync(async (req, res) => {
  const updated = await profileAttributeService.addOption(+req.params.id, req.body.option);
  res.send(updated);
});

const getByKey = catchAsync(async (req, res) => {
  const attribute = await profileAttributeService.getByKey(req.params.key);
  res.send(attribute);
});


const removeOption = catchAsync(async (req, res) => {
  const updated = await profileAttributeService.removeOption(+req.params.id, req.body.option);
  res.send(updated);
});

module.exports = {
  getByKey,
  create,
  getAll,
  getById,
  update,
  remove,
  addOption,
  removeOption,
};
