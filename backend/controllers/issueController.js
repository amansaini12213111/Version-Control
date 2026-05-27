const mongoose = require("mongoose");

const Repository = require("../models/repoModel");
const User = require("../models/userModel");
const Issue = require("../models/issueModel");

async function createIssue(req, res) {

  const { title, description } = req.body;

  const { id } = req.params;

  try {

    const repository =
      await Repository.findById(id);

    if (!repository) {
      return res.status(404).json({
        error: "Repository not found!"
      });
    }

    const issue = new Issue({
      title,
      description,
      repository: id,
    });

    const savedIssue = await issue.save();

    // Push issue into repository
    repository.issues.push(savedIssue._id);

    await repository.save();

    return res.status(201).json({
      message: "Issue created successfully!",
      issue: savedIssue
    });

  } catch (err) {

    console.error(
      "Error during issue creation : ",
      err.message
    );

    return res.status(500).send("Server error");
  }
}

async function updateIssueById(req, res) {

  const { id } = req.params;

  const {
    title,
    description,
    status
  } = req.body;

  try {

    const issue = await Issue.findById(id);

    if (!issue) {
      return res.status(404).json({
        error: "Issue not found!"
      });
    }

    if (title) {
      issue.title = title;
    }

    if (description) {
      issue.description = description;
    }

    if (status) {
      issue.status = status;
    }

    await issue.save();

    return res.json({
      issue,
      message: "Issue updated"
    });

  } catch (err) {

    console.error(
      "Error during issue updation : ",
      err.message
    );

    return res.status(500).send("Server error");
  }
}

async function deleteIssueById(req, res) {

  const { id } = req.params;

  try {

    const issue =
      await Issue.findByIdAndDelete(id);

    if (!issue) {
      return res.status(404).json({
        error: "Issue not found!"
      });
    }

    // Remove issue from repository
    await Repository.findByIdAndUpdate(
      issue.repository,
      {
        $pull: {
          issues: issue._id
        }
      }
    );

    return res.json({
      message: "Issue deleted"
    });

  } catch (err) {

    console.error(
      "Error during issue deletion : ",
      err.message
    );

    return res.status(500).send("Server error");
  }
}

async function getAllIssues(req, res) {

  const { id } = req.params;

  try {

    const issues = await Issue.find({
      repository: id
    });

    return res.status(200).json(issues);

  } catch (err) {

    console.error(
      "Error during issue fetching : ",
      err.message
    );

    return res.status(500).send("Server error");
  }
}

async function getIssueById(req, res) {

  const { id } = req.params;

  try {

    const issue = await Issue.findById(id);

    if (!issue) {
      return res.status(404).json({
        error: "Issue not found!"
      });
    }

    return res.json(issue);

  } catch (err) {

    console.error(
      "Error during issue fetching : ",
      err.message
    );

    return res.status(500).send("Server error");
  }
}

module.exports = {
  createIssue,
  updateIssueById,
  deleteIssueById,
  getAllIssues,
  getIssueById,
};