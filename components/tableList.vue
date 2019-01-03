<template>
  <b-table 
    :data="data"
    :striped="true"
    :mobile-cards="true">
    <template slot-scope="props">
      <b-table-column 
        :visible="false"
        field="id" 
        label="ID" 
        width="40" 
        numeric>
        {{ props.row.id }}
      </b-table-column>

      <b-table-column 
        field="name" 
        label="Name">
        {{ props.row.name }}
      </b-table-column>

      <b-table-column 
        field="description" 
        label="Description">
        {{ props.row.description }}
      </b-table-column>

      <b-table-column 
        style="position: relative;"
        field="color" 
        label="Color">
        <div class="input-color">
          <span>#{{ props.row.color }}</span>
          <div 
            :style="'background-color: #'+props.row.color"
            class="color-box" />
        </div>
      </b-table-column>

      <b-table-column 
        field="url" 
        label="URL">
        <a :href="props.row.url">{{ props.row.url }}</a>
      </b-table-column>
    </template>


    <template slot="empty">
      <section class="section">
        <div class="content has-text-grey has-text-centered">
          <p>
            <b-icon
              icon="emoticon-sad"
              size="is-large"/>
          </p>
          <p>Nothing here.</p>
        </div>
      </section>
    </template>
  </b-table>
</template>

<script>
export default {
  props: {
    data: {
      type: [Array, Object],
      default: () => {
        return []
      }
    }
  }
}
</script>

<style>
.input-color {
  position: relative;
}
.input-color span {
  padding-left: 20px;
}
.input-color .color-box {
  width: 14px;
  height: 14px;
  display: inline-block;
  position: absolute;
  left: 5px;
  top: 5px;
}
</style>
