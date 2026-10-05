import type { PresetWind4Theme } from 'unocss'
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

    'motion-base':
      'transition-opacity,transform,colors duration-500 ease-custom-circ will-change-transform',
    'motion-snug':
      'transition-opacity,transform,colors duration-300 ease-custom-circ will-change-transform',
    'motion-natural':
      'transition-opacity,transform,colors duration-700 ease-custom-circ will-change-transform',
    'motion-relaxed':
      'transition-opacity,transform,colors duration-1000 ease-custom-circ will-change-transform',

    'lay-v': 'grid grid-flow-row [grid-auto-columns:minmax(0,1fr)] [grid-template-rows:minmax(0,auto)]',
    'lay-h': 'grid grid-flow-col [grid-auto-columns:minmax(0,1fr)] [grid-template-rows:minmax(0,auto)]',
    'lay-fluid': 'grid grid-flow-row auto-rows-fr [grid-auto-columns:minmax(0,1fr)]',
    'lay-o': 'grid [&>*]:[grid-area:1/1]',

    'typo-serif-1': 'font-serif text-4 lg:text-4.5 leading-[1.2]',

    // link dentro testi rich text (html da Craft)
    'text-links': '[&_a]:motion-base [&_a]:text-gray-400 [&_a:hover]:text-black',
  },

  theme: {
    colors: {
      ivory: '#F7F5F2',
      peach: '#F6E8D8',
      blush: '#FCEFEF',
      sky: '#E7EEF9',
      lime: '#F5F6DD',
    },
    ease: {
      'custom-expo': 'cubic-bezier(0.19, 1, 0.22, 1)',
      'custom-power': 'cubic-bezier(0.76, 0, 0.24, 1)',
      'custom-expo2': 'cubic-bezier(0.83, 0, 0.17, 1)',
      'custom-circ': 'cubic-bezier(0.25, 1, 0.5, 1)',
    },
    font: {
      serif: '"Adobe Caslon Pro", Georgia, serif',
    },
  },
})
