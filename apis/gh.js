import Octokit from '@octokit/rest'

export const octokit = Octokit({
  timeout: 0, // 0 means no request timeout
  headers: {
    accept: 'application/vnd.github.symmetra-preview+json',
    'user-agent': 'octokit/rest.js v1.2.3' // v1.2.3 will be current version
  },

  // custom GitHub Enterprise URL
  baseUrl: 'https://api.github.com',

  // Node only: advanced request options can be passed as http(s) agent
  agent: undefined
})

const _create = async (owner, repo, label) => {
  console.info(
    `[debug] create labels=${label.name},${label.color},${
      label.description
    } on ${owner}/${repo}`
  )

  const result = await octokit.issues.createLabel({
    owner,
    repo,
    name: label.name,
    color: label.color,
    description: label.description
  })

  return result.data
}

const _delete = async (owner, repo, name) => {
  console.info(`[debug] delete label=${name} in ${owner}/${repo}`)
  if (typeof name === 'string')
    return await octokit.issues.deleteLabel({
      owner,
      repo,
      name
    })
  else
    return await Promise.all(
      name.map(n =>
        octokit.issues.deleteLabel({
          owner,
          repo,
          name: n
        })
      )
    )
}

const _deleteAll = async (owner, repo) => {
  const list = await ListLabel(owner, repo)
  return await _delete(owner, repo, list.map(v => v.name))
}

export const ListLabel = async (owner, repo) => {
  console.info(`[debug] list first 100 label in ${owner}/${repo}`)

  const result = await octokit.issues.listLabelsForRepo({
    owner,
    repo,
    per_page: 100
  })
  return result.data.map(v => {
    return {
      id: v.id,
      name: v.name,
      color: v.color,
      description: v.description,
      url: v.url.replace('https://api.github.com/repos/', 'https://github.com/')
    }
  })
}

export const ListTemplates = async () => {
  console.info(`[debug] list first 10 repository in GH-Label`)

  const result = await octokit.repos.listForOrg({
    org: 'GH-Label',
    per_page: 10
  })

  return result.data.filter(v => v.name.includes('Template')).map(v => {
    const fullname = v.full_name.split('/')
    return {
      owner: fullname[0],
      repo: fullname[1],
      name: v.name.replace(/-template/gi, ''),
      url: v.html_url
    }
  })
}

export const CopyLabel = async (current, dest, _option) => {
  if (!_option) _option = {}

  const option = {
    force: _option.force || true,
    all: _option.all || true
  }

  console.info(
    `[info] copy labels from ${current.owner}/${current.repo} to ${
      dest.owner
    }/${dest.repo}`
  )
  console.info(`[info] copy option ${JSON.stringify(option)}`)

  if (option.force) {
    await _deleteAll(dest.owner, dest.repo)
  }

  if (option.all) {
    const labels = await ListLabel(current.owner, current.repo)
    const results = await Promise.all(
      labels.map(l => {
        return _create(dest.owner, dest.repo, l)
      })
    )

    return results
  }
}
