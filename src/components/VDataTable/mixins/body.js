import RowExpandTransitionFunctions from '../../transitions/row-expand-transition'

export default {
  methods: {
    genTBody () {
      const children = []

      if (!this.itemsLength) {
        children.push(this.genEmptyBody(this.noDataText))
      } else if (!this.filteredItems.length) {
        children.push(this.genEmptyBody(this.noResultsText))
      } else {
        children.push(this.genFilteredItems())
      }

      return this.$createElement('tbody', children)
    },
    genExpandedRow (props) {
      const expand = this.$createElement('div', {
        class: 'datatable__expand-content',
        key: props.item[this.selectedKey],
        directives: [
          {
            name: 'show',
            value: this.expanded[props.item[this.selectedKey]]
          }
        ]
      }, [this.$scopedSlots.expand(props)])

      const transition = this.$createElement('transition-group', {
        class: 'datatable__expand-col',
        attrs: { colspan: '100%' },
        props: {
          tag: 'td',
          type: 'transition',
          css: true
        },
        on: RowExpandTransitionFunctions
      }, [expand])

      return this.genTR([transition], {
        class: 'datatable__expand-row'
      })
    },
    genFilteredItems () {
      const rows = []
      this.filteredItems.forEach((item, index) => {
        const props = { item, index }
        const key = this.selectedKey

        Object.defineProperty(props, 'selected', {
          get: () => this.selected[item[this.selectedKey]],
          set: (value) => {
            let selected = this.value.slice()
            if (value) selected.push(item)
            else selected = selected.filter(i => i[key] !== item[key])

            this.$emit('input', selected)
          }
        })

        Object.defineProperty(props, 'expanded', {
          get: () => this.expanded[item[this.selectedKey]],
          set: (value) => {
            if (!this.expand) {
              Object.keys(this.expanded).forEach((key) => {
                this.$set(this.expanded, key, false)
              })
            }
            this.$set(this.expanded, item[this.selectedKey], value)
          }
        })

        const row = this.$scopedSlots.items(props)

        rows.push(this.needsTR(row)
          ? this.genTR(row, {
            attrs: { active: this.isSelected(item) }
          })
          : row)

        if (this.$scopedSlots.expand) {
          const expandRow = this.genExpandedRow(props)
          rows.push(expandRow)
        }
      })

      return rows
    },
    genEmptyBody (text) {
      return this.genTR([this.$createElement('td', {
        'class': 'text-xs-center',
        attrs: { colspan: '100%' }
      }, text)])
    }
  }
}
