<template>
  <div class="section">
    <b-loading 
      :is-full-page="true" 
      :active.sync="isLoading" 
      :can-cancel="true"/>
    <section>
      <b-field horizontal>
        <p class="control">
          <button 
            :disabled="token"
            class="button is-danger is-outlined"
            @click="login">
            {{ token ? "Signed" : "Login" }}
          </button>
          <span 
            :class="{'is-hidden': !token}" 
            style="margin-left: 6px; vertical-align: -webkit-baseline-middle">with '{{ token }}'</span>
        </p>
      </b-field>
      <b-field 
        v-show="error"
        horizontal 
        label="Error">
        <div>
          <h6>{{ error }}</h6>
        </div>
      </b-field>

      <b-field 
        horizontal 
        label="Query type">
        <b-dropdown v-model="queryType">
          <button 
            slot="trigger" 
            class="button is-secondary" 
            type="button">
            <template 
              v-for="type in queryTypes" 
              v-if="queryType === type.name" >
              <b-icon 
                :key="type.name"
                :icon="type.icon"/>
              <span :key="'span-'+type.name">{{ type.name }}</span>
            </template>
            <b-icon icon="menu-down"/>
          </button>

          <b-dropdown-item 
            v-for="type in queryTypes" 
            :key="type.name"
            :value="type.name">
            <div class="media">
              <b-icon 
                :icon="type.icon"
                class="media-left"/>
              <div class="media-content">
                <h3>{{ type.name }}</h3>
                <small>{{ type.desc }}</small>
              </div>
            </div>
          </b-dropdown-item>
        </b-dropdown>
      </b-field>

      <b-field 
        horizontal 
        label="Templates" >
        <b-field>
          <p 
            v-for="template in templates" 
            :key="template.name"
            class="control">
            <button 
              class="button" 
              @click="updateByTemplate(template)">
              {{ template.name }}
            </button>
          </p>
        </b-field>
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
            placeholder="GH-Label" 
            expanded/>
          <p class="control">
            <span class="button is-static">/</span>
          </p>
          <b-input 
            v-model="current.repo"
            placeholder="Github-Default-Template" 
            expanded/>
        </b-field>
      </b-field>

      <b-field 
        v-show="queryType === 'Copy'"
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
      <b-field 
        v-show="queryType === 'Copy'"
        horizontal 
        label="Options" >
        <b-checkbox-button 
          v-model="options"
          native-value="replace"
          type="is-danger">
          <b-icon icon="check"/>
          <span>Replace</span>
        </b-checkbox-button>
      </b-field>
      <b-field horizontal><!-- Label left empty for spacing -->
        <p class="control">
          <button 
            :disabled="!token" 
            class="button is-success"
            @click="submit">
            Submit
          </button>
        </p>
      </b-field>
    </section>
    <div class="response">
      <list-as-table 
        v-if="queryType==='List'" 
        :data="response"/>
      <div v-if="queryType==='Copy'" >
        <completed 
          :response="response" 
          :base="current" 
          :dest="dest"/>
      </div>
    </div>
  </div>
</template>

<script>
import netlify from 'netlify-auth-providers'

import ListAsTableComponent from '../components/tableList.vue'
import CompletedComponent from '../components/completed.vue'

import { octokit, ListLabel, CopyLabel, ListTemplates } from '../apis/gh'

const TOKEN_NAME = 'gh-labels-replacer-token'

const submitTransfer = async (type, token, current, dest, options) => {
  console.log('Submit transfer the issue labels')

  octokit.authenticate({
    type: 'token',
    token: token
  })

  if (type === 'List') return await ListLabel(current.owner, current.repo)
  else if (type === 'Copy')
    return await CopyLabel(current, dest, {
      force: options.includes('replace')
    })
  else return {}
}

export default {
  name: 'HomePage',
  components: {
    'list-as-table': ListAsTableComponent,
    completed: CompletedComponent
  },
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
      isLoading: false,
      response: [],
      queryType: 'List',
      queryTypes: [
        {
          name: 'List',
          desc: 'List all labels in repository',
          icon: 'format-list-bulleted'
        },
        {
          name: 'Copy',
          desc: 'Make a copy labels to dest repo',
          icon: 'content-copy'
        }
      ],
      options: ['replace'],
      templates: []
    }
  },
  async asyncData({ query, app }) {
    const cookies = app.$cookies

    const curr = { owner: '', repo: '' }
    if (query.cowner) curr.owner = query.cowner
    if (query.crepo) curr.repo = query.crepo

    const dest = { owner: '', repo: '' }
    if (query.downer) dest.owner = query.downer
    if (query.drepo) dest.repo = query.drepo

    let token = query.access_token

    if (!token) token = cookies.get(TOKEN_NAME)
    else
      cookies.set(TOKEN_NAME, query.access_token, {
        maxAge: 60 * 60 * 24 * 7
      })

    let templates = []
    if (token) {
      octokit.authenticate({
        type: 'token',
        token: token
      })

      templates = await ListTemplates()
    }

    return {
      current: curr,
      dest,
      token: token,
      queryType: query.type || 'List',
      templates
    }
  },
  async mounted() {
    if (this.callSubmit) {
      this.isLoading = true
      this.response = await submitTransfer(
        this.queryType,
        this.token,
        this.current,
        this.dest,
        this.options
      )
      this.isLoading = false
    }
  },
  methods: {
    login() {
      const authenticator = new netlify({
        site_id: '04a1e213-d4d1-4c68-970f-88a1cea8759d'
      })

      authenticator.authenticate(
        { provider: 'github', scope: 'repo' },
        (err, data) => {
          if (err) {
            this.error = 'Error Authenticating with GitHub: ' + err
          }
          this.token = data.token

          this.$cookies.set(TOKEN_NAME, this.token, {
            maxAge: 60 * 60 * 24 * 7
          })
        }
      )
    },
    async submit() {
      this.isLoading = true
      this.response = await submitTransfer(
        this.queryType,
        this.token,
        this.current,
        this.dest,
        this.options
      )
      this.isLoading = false
    },
    updateByTemplate(template) {
      console.info(
        `[debug] update base repository from ${this.current.owner}/${
          this.current.repo
        } to ${template.owner}/${template.repo}`
      )

      this.current.owner = template.owner
      this.current.repo = template.repo
    }
  }
}
</script>

<style lang="scss">
.response {
  margin: 3rem;
}
</style>
