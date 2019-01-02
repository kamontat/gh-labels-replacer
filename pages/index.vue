<template>
  <section class="section">
    <div id="netlify-modal"/>
    <div>
      <button @click="login">Login</button>
      <div>
        <h3>User: {{ user }}</h3>
        <h4>Token: {{ token }}</h4>
        <h6>Error: {{ error }}</h6>
      </div>
    </div>
  </section>
</template>

<script>
// import netlify from 'netlify-auth-providers'
import netlifyIdentity from 'netlify-identity-widget'

export default {
  name: 'HomePage',
  data() {
    return {
      token: '',
      error: ''
    }
  },
  async asyncData() {
    netlifyIdentity.init({})

    return {
      user: netlifyIdentity.currentUser()
    }
  },
  methods: {
    login() {
      console.log(netlifyIdentity)

      netlifyIdentity.open('login')

      // const authenticator = new netlify({
      //   site_id: '04a1e213-d4d1-4c68-970f-88a1cea8759d'
      // })

      // console.log(authenticator)

      // authenticator.authenticate(
      //   { provider: 'github', scope: 'repo' },
      //   (err, data) => {
      //     if (err) {
      //       this.error = err
      //     }

      //     this.token = data.token
      //   }
      // )
    }
  }
}
</script>
