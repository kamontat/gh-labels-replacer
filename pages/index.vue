<template>
  <section class="section">
    <section>
      <b-field horizontal>
        <p class="control">
          <button 
            class="button is-danger is-outlined"
            @click="login">
            {{ token ? "Logout" : "Login" }}
          </button>
        </p>
      </b-field>
      <b-field horizontal>
        <div>
          <h6>Error: {{ error }}</h6>
        </div>
      </b-field>
      <b-field 
        horizontal 
        label="Base" >
        <b-field>
          <p class="control">
            <span class="button is-static">From</span>
          </p>
          <b-input 
            v-model="current.owner"
            placeholder="kamontat" 
            expanded/>
          <p class="control">
            <span class="button is-static">/</span>
          </p>
          <b-input 
            v-model="current.repo"
            placeholder="gh-labels-replacer" 
            expanded/>
        </b-field>
      </b-field>

      <b-field 
        horizontal 
        label="Destination" >
        <b-field>
          <p class="control">
            <span class="button is-static">To</span>
          </p>
          <b-input 
            v-model="dest.owner"
            placeholder="kamontat" 
            expanded/>
          <p class="control">
            <span class="button is-static">/</span>
          </p>
          <b-input 
            v-model="dest.repo"
            placeholder="gh-labels-replacer" 
            expanded/>
        </b-field>
      </b-field>
      <b-field horizontal><!-- Label left empty for spacing -->
        <p class="control">
          <button 
            :disabled="!token" 
            class="button is-primary"
            @click="submit">
            Transfer
          </button>
        </p>
      </b-field>
    </section>
    <div>
      {{ response }}
    </div>
  </section>
</template>

<script>
import netlifyIdentity from 'netlify-identity-widget'
import Octokit from '@octokit/rest'

const octokit = Octokit({
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

const _list = async (owner, repo) => {
  console.info(`[debug] list first 100 label in ${owner}/${repo}`)

  const result = await octokit.issues.listLabelsForRepo({
    owner,
    repo,
    per_page: 100
  })
  return result.data.map(v => {
    return {
      name: v.name,
      color: v.color,
      description: v.description,
      url: v.url.replace('https://api.github.com/repos/', 'https://github.com/')
    }
  })
}

const submitTransfer = (token, current, dest) => {
  console.log('Submit transfer the issue labels')

  octokit.authenticate({
    type: 'token',
    token: token
  })

  return _list(current.owner, current.repo)
}

export default {
  name: 'HomePage',
  data() {
    return {
      token: '',
      error: '',
      email: '',
      current: {
        owner: '',
        repo: ''
      },
      dest: {
        owner: '',
        repo: ''
      },
      callSubmit: false,
      response: {}
    }
  },
  async asyncData({ query }) {
    netlifyIdentity.init({})
    const user = netlifyIdentity.currentUser()
    console.log(user)

    const curr = {}
    if (query.cowner) curr.owner = query.cowner
    if (query.crepo) curr.repo = query.crepo

    const dest = {}
    if (query.downer) dest.owner = query.downer
    if (query.drepo) dest.repo = query.drepo

    if (user) {
      return {
        email: user.email,
        token: user.token.access_token,
        current: curr,
        dest: dest,
        callSubmit: query.submit
      }
    }
    return {}
  },
  mounted() {
    if (this.callSubmit)
      this.response = submitTransfer(this.token, this.current, this.dest)
  },
  methods: {
    login() {
      if (this.token) netlifyIdentity.logout()
      else netlifyIdentity.open('login')
    },
    submit() {
      this.response = submitTransfer(this.token, this.current, this.dest)
    }
  }
}
</script>
