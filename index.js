const {ArrayToCanvas, Corner} = require( './ArrayManager/ArrayToCanvas' );
const {ArrayToEmbed} = require( './ArrayManager/ArrayToEmbed' );
const {buttons} = require( './ArrayManager' );
const {ButtonBuilder} = require( 'discord.js' );


module.exports = {
	ArrayToCanvas,
	ArrayToEmbed,
	Corner,
	/**
	 * Return an object containing the needed buttons
	 * @example
	 * buttons = getButtons()
	 * @return {{previous: ButtonBuilder, current_page: ButtonBuilder, next: ButtonBuilder, exit: ButtonBuilder}}
	 */
	getButtons: () => {
		const _buttons = {};
		Object.entries( buttons ).forEach( entry => {
			_buttons[entry[0]] = new ButtonBuilder();
			_buttons[entry[0]].data = {...entry[1].data};
		} );
		return _buttons;
	},
};
