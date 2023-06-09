/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		'./pages/**/*.{js,ts,jsx,tsx,mdx}',
		'./components/**/*.{js,ts,jsx,tsx,mdx}',
		'./app/**/*.{js,ts,jsx,tsx,mdx}',
	],
	theme: {
		extend: {
			colors: {
				primary: {
					main: "#fb7185",
					light: "#fda4af",
					dark: "#f43f5e",
					contrastText: "#f8fafc"
				}
			}
		},
	},
	plugins: [],
}
