export default defineAppConfig({
  ui: {
    colors: {
      primary: 'my-yellow'
    },
    input: {
      slots: {
        root: 'w-full',
        base: 'rounded-lg',
        leadingIcon: 'text-2xl text-black',
      },
      variants: {
        size: {
          'xl': {
            base: 'px-3 py-3'
          }
        },
        variant: {
          outline: 'ring-0'
        }
      },
      compoundVariants: [
        {
          color: 'primary',
          class: 'focus-visible:ring-0'
        },
        {
          color: 'primary',
          highlight: true,
          class: 'ring-0 ring-inset ring-(--ui-primary)'
        },
      ]
    },
    select: {
      slots: {

      },
      variants: {
        variant: {
          outline: "bg-gray-1 ring-0"
        }
      },
      compoundVariants: [
        {
          color: 'primary',
          highlight: true,
          class: 'ring-0 ring-inset ring-primary'
        },
      ]
    }
  },

});
