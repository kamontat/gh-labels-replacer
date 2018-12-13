const express = require("express");
const octokit = require("@octokit/rest")({
  timeout: 0, // 0 means no request timeout
  headers: {
    accept: "application/vnd.github.symmetra-preview+json",
    "user-agent": "octokit/rest.js v1.2.3" // v1.2.3 will be current version
  },

  // custom GitHub Enterprise URL
  baseUrl: "https://api.github.com",

  // Node only: advanced request options can be passed as http(s) agent
  agent: undefined
});

const app = express();
const port = 8888;

// const username = "kamontat";

const markAuthentication = _token => {
  const token = _token || process.env.GH_TOKEN || process.env.GITHUB_TOKEN;

  octokit.authenticate({
    type: "token",
    token: token
  });
};

const _create = async (owner, repo, label) => {
  const result = await octokit.issues.createLabel({
    owner,
    repo,
    name: label.name,
    color: label.color,
    description: label.description
  });

  return result.data;
};

const _delete = async (owner, repo, name) => {
  if (typeof name === "string") return await octokit.issues.deleteLabel({ owner, repo, name });
  else return await Promise.all(name.map(n => octokit.issues.deleteLabel({ owner, repo, name: n })));
};

const _deleteAll = async (owner, repo) => {
  const list = await _list(owner, repo);
  return await _delete(owner, repo, list.map(v => v.name));
};

const _list = async (owner, repo) => {
  const result = await octokit.issues.listLabelsForRepo({ owner, repo, per_page: 100 });
  return result.data.map(v => {
    return {
      name: v.name,
      color: v.color,
      description: v.description
    };
  });
};

const list = async (req, res) => {
  const owner = req.params.user;
  const repo = req.params.repo;

  console.log(`list labels owner=${owner}, repo=${repo}`);

  try {
    res.send({
      results: await _list(owner, repo)
    });
  } catch (e) {
    res.status(e.status || 400).send(e);
  }
};

const copy = async (req, res) => {
  const option = {
    force: req.query.force || true,
    all: req.query.all || true
  };

  const current = {
    owner: req.params.currentUser,
    repo: req.params.currentRepo
  };

  const dest = {
    owner: req.params.destUser,
    repo: req.params.destRepo
  };

  if (option.force) {
    await _deleteAll(dest.owner, dest.repo);
  }

  if (option.all) {
    const labels = await _list(current.owner, current.repo);
    const results = await Promise.all(
      labels.map(l => {
        return _create(dest.owner, dest.repo, l);
      })
    );

    res.send({ results });
  }
};

app.get("/", async (req, res) => {
  res.send(`# APIs <br/><br/>
* list all labels on path /list/:user/:repo <br/>
* copy labels on path     /copy/:currentUser/:currentRepo/:destUser/:destRepo <br/>
`);
});

app.get("/list/:user/:repo", async (req, res) => {
  markAuthentication();
  await list(req, res);
});

app.get("/list/:user/:repo/(:token)?", async (req, res) => {
  markAuthentication(req.params.token);
  await list(req, res);
});

app.get("/copy/:currentUser/:currentRepo/:destUser/:destRepo", async (req, res) => {
  markAuthentication();
  await copy(req, res);
});

app.get("/copy/:currentUser/:currentRepo/:destUser/:destRepo/(:token)?", async (req, res) => {
  markAuthentication(req.params.token);
  await copy(req, res);
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
