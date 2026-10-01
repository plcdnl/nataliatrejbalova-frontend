import { defineConfig, presetWind4, transformerDirectives } from 'unocss'

export default defineConfig({
  presets: [
    presetWind4({
      preflights: {
        reset: true,
      },
    }),
  ],

  transformers: [
    transformerDirectives(),
  ],

  blocklist: [
    'container',
  ],
  extendTheme: (theme: PresetWind4Theme) => {
    return {
      ...theme,
      breakpoint: {
        ...theme.breakpoint,
        '3xl': '1680px',
        '4xl': '1920px',
        '5xl': '2560px',
      },
    }
  },
  shortcuts: {
    'capsize': '[text-box-edge:cap_alphabetic] [text-box-trim:trim-both]',

    // Transition utils
    'motion-base':
      'transition-opacity,transform,colors duration-500 ease-custom-circ will-change-transform',
    'motion-snug':
      'transition-opacity,transform,colors duration-300 ease-custom-circ will-change-transform',
    'motion-natural':
      'transition-opacity,transform,colors duration-700 ease-custom-circ will-change-transform',
    'motion-relaxed':
      'transition-opacity,transform,colors duration-1000 ease-custom-circ will-change-transform',

    // Layout utils
    'lay-v': 'grid grid-flow-row [grid-auto-columns:minmax(0,1fr)] [grid-template-rows:minmax(0,auto)]',
    'lay-h': 'grid grid-flow-col [grid-auto-columns:minmax(0,1fr)] [grid-template-rows:minmax(0,auto)]',
    'lay-fluid': 'grid grid-flow-row auto-rows-fr [grid-auto-columns:minmax(0,1fr)]',
    'lay-o': 'grid [&>*]:[grid-area:1/1]',

    // Typography
    'typo-sans-1': 'capsize font-sans font-medium text-3 leading-3.5 lg:text-3.5 lg:leading-3.75 tracking-0.01em', // legal / fine print
  },

  theme: {
    colors: {

    },
    ease: {
      'custom-expo': 'cubic-bezier(0.19, 1, 0.22, 1)',
      'custom-power': 'cubic-bezier(0.76, 0, 0.24, 1)',
      'custom-expo2': 'cubic-bezier(0.83, 0, 0.17, 1)',
      'custom-circ': 'cubic-bezier(0.25, 1, 0.5, 1)',
    },
    font: {
      sans: '"Inter", Arial, sans-serif',
    },
  },
})
