const {ActionRowBuilder, SelectMenuBuilder} = require( 'discord.js' );
const ArrayManager = require( './index' );


/**
 * @author 🅣 🅞 🅚 🅐#9652
 * @class
 * @name ArrayToEmbed
 * @extends ArrayManager
 * @exports ArrayToEmbed
 * @description Create an embed from an arrayFields
 * @example
 * > Readme.md
 * @param {EmbedBuilder} embed An embed
 * @param {[{string, string}]} arrayFields ArrayFields of object with two fields
 * @param {[{string, string, string}]} arrayMenu
 * @param {SelectMenuBuilder} selectMenu
 * @param {{ButtonBuilder}} buttons Must contains 'next' and 'previous'
 * @param {number} itemPerPage Item count displayed on each page
 * @param {number} itemPerColumn Item count displayed on each column
 */
module.exports = class ArrayToEmbed extends ArrayManager {
	constructor() {super();}
	
	/**
	 * @name #createMenu
	 * @description Create the menu choice list
	 * @param arrayMenu
	 * @return {ActionRowBuilder}
	 */
	#createMenu(arrayMenu) {
		const menuOption = this.selectMenu.options.length;
		if (arrayMenu && this.itemPerPage + menuOption > 25) throw new Error( `Select menu : Item per page must be <= 25\nReceived item per page(${this.itemPerPage}), select menu options(${menuOption}), Total ${this.itemPerPage + menuOption}` );
		
		const selectMenu = new SelectMenuBuilder();
		selectMenu.data = this.selectMenu.data;
		return new ActionRowBuilder().setComponents( selectMenu.setOptions( (arrayMenu ? arrayMenu : []).concat( [...this.selectMenu.options] ) ) );
	}
	
	/**
	 * @name #createFields
	 * @description Create embed fields
	 * @param {Object[]} arrayFields
	 * @return {EmbedBuilder} the embed
	 */
	#createFields(arrayFields) {
		let count = -1;
		
		this.embed.data.fields = arrayFields.flatMap( obj => {
			const values = Object.values( obj );
			count++;
			
			if (this.itemPerRow === 1) {
				return {
					name: values[0],
					value: values[1],
					inline: false,
				};
			} else if (!count || count % this.itemPerRow || this.itemPerRow === 3) {
				return {
					name: values[0],
					value: values[1],
					inline: true,
				};
			} else {return [{name: '\u200b', value: '\u200b'}, {name: values[0], value: values[1], inline: true}];}
		} );
		
		return this.embed;
	}
	
	/**
	 * @name render
	 * @description Render the embed
	 * @return {{tts: boolean, components: *[], files: *[], ephemeral: (boolean|*), embed: *[], embeds: (EmbedBuilder[]|*[]), content: null}}
	 */
	render() {
		const elementsToDisplay = super.render();
		
		return {
			tts: false,
			content: null,
			embeds: elementsToDisplay[0] ? [this.#createFields( elementsToDisplay[0] )] : [],
			components: [this.actionRow].concat( this.selectMenu ? this.#createMenu( elementsToDisplay[1] ) : [] ),
			files: [],
			ephemeral: this.ephemeral,
		};
	}
	
	checker() {
		super.checker();
		if (!this.embed) throw new Error( 'Missing embed parameter. (this.setEmbed)' );
		
	}
};