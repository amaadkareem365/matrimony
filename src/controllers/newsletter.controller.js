const httpStatus = require("http-status");
const catchAsync = require("../utils/catchAsync");
const newsletterService = require("../services/newsletter.service");


const createNewsletter = catchAsync(async (req, res) => {
  const newsletter = await newsletterService.createNewsletter(req.body);
  res.status(httpStatus.CREATED).send(newsletter);
});

const getAllNewsletters = catchAsync(async (req, res) => {
  const newsletters = await newsletterService.getAllNewsletters();
  res.send(newsletters);
});

const getNewsletter = catchAsync(async (req, res) => {
  const newsletter = await newsletterService.getNewsletter(req.params.id);
  res.send(newsletter);
});

const deleteNewsletter = catchAsync(async (req, res) => {
  await newsletterService.deleteNewsletter(req.params.id);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createNewsletter,
  getAllNewsletters,
  getNewsletter,
  deleteNewsletter,
};