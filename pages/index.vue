<template>
  <section class="section">
    <section>
      <b-field horizontal>
        <p class="control">
          <button 
            class="button is-danger is-outlined"
            @click="login">
            Login
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
            placeholder="kamontat" 
            expanded/>
          <p class="control">
            <span class="button is-static">/</span>
          </p>
          <b-input 
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
            placeholder="kamontat" 
            expanded/>
          <p class="control">
            <span class="button is-static">/</span>
          </p>
          <b-input 
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
  </section>
</template>

<script>
import netlifyIdentity from 'netlify-identity-widget'

export default {
  name: 'HomePage',
  data() {
    return {
      token: '',
      error: '',
      email: '',
      fullname: ''
    }
  },
  async asyncData() {
    netlifyIdentity.init({})

    const user = netlifyIdentity.currentUser()
    if (user) {
      return {
        email: user.email,
        fullname: user.user_metadata.full_name,
        token: user.token.access_token
      }
    }
    return {}
  },
  methods: {
    login() {
      netlifyIdentity.open('login')
    },
    submit() {
      console.log('submit the label Transfer')
    }
  }
}
</script>
