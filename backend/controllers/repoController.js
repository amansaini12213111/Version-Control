const mongoose = require("mongoose");
const Repository = require("../models/repoModel");
const User = require("../models/userModel");
const Issue = require("../models/issueModel");

async function createRepository(req, res) {

  const {
    owner,
    name,
    issues,
    content,
    description,
    visibility
  } = req.body;

  try {

    if (!name) {
      return res.status(400).json({
        error: "Repository name is required!"
      });
    }

    if (!mongoose.Types.ObjectId.isValid(owner)) {
      return res.status(400).json({
        error: "Invalid User ID!"
      });
    }

    const user = await User.findById(owner);

    if (!user) {
      return res.status(404).json({
        error: "User not found!"
      });
    }

    const newRepository = new Repository({
      name,
      description,
      visibility,
      owner,
      content,
      issues,
    });

    // Save repository
    const result = await newRepository.save();

    // Push repository ID into user's repositories array
    await User.findByIdAndUpdate(
      owner,
      {
        $push: {
          repositories: result._id
        }
      }
    );

    return res.status(201).json({
      message: "Repository created!",
      repositoryID: result._id,
    });

  } catch (err) {

    console.error(
      "Error during repository creation:",
      err.message
    );

    return res.status(500).send("Server error");
  }
}

async function getAllRepositories(req, res) {

  try {

    const repositories = await Repository.find({})
      .populate("owner")
      .populate("issues");

    return res.json(repositories);

  } catch (err) {

    console.error(
      "Error during fetching repositories : ",
      err.message
    );

    return res.status(500).send("Server error");
  }
}

async function fetchRepositoryById(req, res) {

  const { id } = req.params;

  try {

    const repository = await Repository.findById(id)
      .populate("owner")
      .populate("issues");

    if (!repository) {
      return res.status(404).json({
        error: "Repository not found!"
      });
    }

    return res.json(repository);

  } catch (err) {

    console.error(
      "Error during fetching repository : ",
      err.message
    );

    return res.status(500).send("Server error");
  }
}

async function fetchRepositoryByName(req, res) {

  const { name } = req.params;

  try {

    const repository = await Repository.findOne({ name })
      .populate("owner")
      .populate("issues");

    if (!repository) {
      return res.status(404).json({
        error: "Repository not found!"
      });
    }

    return res.json(repository);

  } catch (err) {

    console.error(
      "Error during fetching repository : ",
      err.message
    );

    return res.status(500).send("Server error");
  }
}

async function fetchRepositoriesForCurrentUser(req, res) {

  const { userID } = req.params;

  try {

    const repositories = await Repository.find({
      owner: userID
    })
      .populate("owner")
      .populate("issues");

    return res.json({
      message: "Repositories found!",
      repositories: repositories || []
    });

  } catch (err) {

    console.error(
      "Error during fetching user repositories : ",
      err.message
    );

    return res.status(500).send("Server error");
  }
}

async function updateRepositoryById(req, res) {

  const { id } = req.params;

  const {
    content,
    description
  } = req.body;

  try {

    const repository = await Repository.findById(id);

    if (!repository) {
      return res.status(404).json({
        error: "Repository not found!"
      });
    }

    if (content) {
      repository.content.push(content);
    }

    if (description) {
      repository.description = description;
    }

    const updatedRepository =
      await repository.save();

    return res.json({
      message: "Repository updated successfully!",
      repository: updatedRepository,
    });

  } catch (err) {

    console.error(
      "Error during updating repository : ",
      err.message
    );

    return res.status(500).send("Server error");
  }
}

async function toggleVisibilityById(req, res) {

  const { id } = req.params;

  try {

    const repository = await Repository.findById(id);

    if (!repository) {
      return res.status(404).json({
        error: "Repository not found!"
      });
    }

    repository.visibility =
      !repository.visibility;

    const updatedRepository =
      await repository.save();

    return res.json({
      message:
        "Repository visibility toggled successfully!",
      repository: updatedRepository,
    });

  } catch (err) {

    console.error(
      "Error during toggling visibility : ",
      err.message
    );

    return res.status(500).send("Server error");
  }
}

async function deleteRepositoryById(req, res) {

  const { id } = req.params;

  try {

    const repository =
      await Repository.findByIdAndDelete(id);

    if (!repository) {
      return res.status(404).json({
        error: "Repository not found!"
      });
    }

    // Remove repo from user's repositories array
    await User.findByIdAndUpdate(
      repository.owner,
      {
        $pull: {
          repositories: repository._id
        }
      }
    );

    return res.json({
      message: "Repository deleted successfully!"
    });

  } catch (err) {

    console.error(
      "Error during deleting repository : ",
      err.message
    );

    return res.status(500).send("Server error");
  }
}

module.exports = {
  createRepository,
  getAllRepositories,
  fetchRepositoryById,
  fetchRepositoryByName,
  fetchRepositoriesForCurrentUser,
  updateRepositoryById,
  toggleVisibilityById,
  deleteRepositoryById,
};