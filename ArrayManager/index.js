const {ActionRowBuilder, SelectMenuBuilder, ButtonStyle} = require( 'discord.js' );


/**
 * @name button
 * @type {{next: string, previous: string, current_page: string}}
 */
const button = {
	next: 'next',
	previous: 'previous',
	current_page: 'current_page',
};

/**
 * @name page
 * @type {{middle: number, last: number, first: number}}
 */
const page = {
	first: 0,
	middle: 1,
	last: 2,
};

/**
 * @author 🅣 🅞 🅚 🅐#9652
 * @name ArrayManager
 * @exports ArrayManager
 * @description Manage an array in pages displayable into an embed
 *
 * @param {EmbedBuilder} embed An embed
 * @param {[{string, string}]} arrayFields ArrayFields of object with two fields
 * @param {[{string, string, string}]} arrayOptions
 * @param {SelectMenuBuilder} selectMenu
 * @param {{ButtonBuilder}} buttons Must contains 'next' and 'previous'
 * @param {number} itemPerPage Item count displayed on each page
 * @param {number} itemPerColumn Item count displayed on each column
 */
module.exports = class ArrayManager {
	embed;
	arrayFields;
	arrayOptions;
	selectMenu;
	#buttons;
	actionRow = new ActionRowBuilder();
	#totalPage;
	#currPageNumber = 0;
	#currPage = page.first;
	itemPerPage;
	itemPerRow;
	itemPerColumn;
	#item_count;
	#displayCurrentPageInfo = true;
	#countOnbutton = false;
	ephemeral = false;
	
	/**
	 * @name setEphemeral
	 * @description Set embed
	 * @param {boolean} boolean
	 * @return {this}
	 */
	setEphemeral(boolean) {
		this.ephemeral = boolean;
		return this;
	}
	
	/**
	 * @name setEmbed
	 * @description Set embed
	 * @param {EmbedBuilder} embed
	 * @return {this}
	 */
	setEmbed(embed) {
		this.embed = embed;
		return this;
	}
	
	/**
	 * @name setSelectMenu
	 * @description Set selectMenu
	 * @param {SelectMenuBuilder} selectMenu
	 * @return {this}
	 */
	setSelectMenu(selectMenu) {
		this.selectMenu = selectMenu;
		return this;
	}
	
	/**
	 * @name setFields
	 * @description Set array
	 * @param {[{string, string}]} arrayFields arrayFields of object with two fields
	 * @return {this}
	 */
	setFields(arrayFields) {
		this.arrayFields = arrayFields;
		this.#setTotalPage();
		return this;
	}
	
	/**
	 * @name setOptions
	 * @description Set arrayOptions
	 * @param {[{string, string, string}]} arrayOptions
	 * @return {this}
	 */
	setOptions(arrayOptions) {
		this.arrayOptions = arrayOptions;
		this.#setTotalPage();
		return this;
	}
	
	/**
	 * @name setButtons
	 * @description Set buttons
	 * @param {{ButtonBuilder}} buttons
	 * @return {this}
	 */
	setButtons(buttons) {
		try {
			this.#buttons = {
				buttonId: Object.values( buttons ).map( button => button.data.custom_id ),
				button: Object.values( buttons ),
			};
		} catch (e) {
			throw new Error( `Provided buttons are invalids` );
		}
		
		if (!this.buttonExist( button.previous )) throw new Error( `Add a '${button.previous}' button to the button list` );
		if (!this.buttonExist( button.next )) throw new Error( `Add a '${button.next}' button to the button list` );
		return this;
	}
	
	/**
	 * @name setColumnCount
	 * @description Number of columns (>1 && <=25)
	 * @param {number} columnCount
	 * @return {this}
	 */
	setColumnCount(columnCount) {
		//if (columnCount > 3) throw new Error('Item per row : Max is 3')
		this.itemPerRow = columnCount;
		this.#setItemPerPage();
		return this;
	}
	
	/**
	 * @name setRowCount
	 * @description Number of rows (1 || 2 || 3)
	 * @param {number} rowCount
	 * @return {this}
	 */
	setRowCount(rowCount) {
		if (rowCount > 25) throw new Error( 'Row count : Max is 25' );
		this.itemPerColumn = rowCount;
		this.#setItemPerPage();
		return this;
	}
	
	/**
	 * @name #setItemPerPage
	 * @description Item count displayed on each page
	 */
	#setItemPerPage() {
		if (this.itemPerColumn && this.itemPerRow) {
			this.itemPerPage = this.itemPerColumn * this.itemPerRow;
			const rowSpacing = this.itemPerRow === 1 || this.itemPerRow === 3 ? 0 : this.itemPerPage / this.itemPerRow;
			
			if (this.arrayFields < 25) {
				if (this.itemPerPage > 25 - rowSpacing) throw new Error( `Embed fields : Item per page must be <= 25\nReceived,  item per page ${this.itemPerRow}x${this.itemPerColumn}=${this.itemPerPage}, Row spacing ${rowSpacing} equals ${this.itemPerPage + rowSpacing}\nNote: Item per row != 1 and != 3 adds extra row spacing of (row count per page - 1, row count per page = arrayField.length / item per page / item per row)` );
			}
			this.#setTotalPage();
		}
	}
	
	/**
	 * @name setTotalPage
	 * @description Set the number of page
	 */
	#setTotalPage() {
		if (this.arrayFields || this.arrayOptions) {
			this.#item_count = this.arrayFields ? this.arrayFields.length : this.arrayOptions.length;
			if (this.itemPerPage && this.#item_count) {
				this.#totalPage = Math.floor( (this.#item_count - 1) / this.itemPerPage );
			}
		}
	}
	
	/**
	 * @name displayCurrentPageInfo
	 * @description Display or not the page counter
	 * @param {boolean} boolean
	 * @return {this}
	 */
	displayCurrentPageInfo(boolean) {
		if (!this.buttonExist( button.current_page )) throw new Error( `Add a '${button.current_page}' button to the button list` );
		this.#displayCurrentPageInfo = boolean;
		return this;
	}
	
	/**
	 * @name countOnbutton
	 * @description Display or not the page counter on the previous and next buttons
	 * @param {boolean} boolean
	 * @return {this}
	 */
	countOnbutton(boolean) {
		this.#countOnbutton = boolean;
		return this;
	}
	
	/**
	 * @name getButton
	 * @description Get a button by id
	 * @param {string} buttonId
	 * @return {ButtonBuilder}
	 */
	getButton(buttonId) {
		return this.#buttons.button[this.#getButtonIndex( buttonId )];
	}
	
	/**
	 * @name #getButtonIndex
	 * @description Get a button index by id
	 * @param {string} buttonId
	 * @return {ButtonBuilder}
	 */
	#getButtonIndex(buttonId) {
		const buttonIndex = this.#buttons.buttonId.indexOf( buttonId );
		if (buttonIndex === -1) {
			throw Error( 'Invalid button name' );
		} else {
			return buttonIndex;
		}
	}
	
	/**
	 * @name buttonExist
	 * @description Check if a button exist
	 * @param {string} buttonId
	 * @return {boolean}
	 */
	buttonExist(buttonId) {
		return this.#buttons.buttonId.includes( buttonId );
	}
	
	/**
	 * @name setLabel
	 * @description Update button label
	 * @param {string} buttonId
	 * @param {string} label
	 */
	setLabel(buttonId, label) {
		this.getButton( buttonId ).setLabel( label );
		return this;
	}
	
	/**
	 * @name setCustomId
	 * @description Update button id
	 * @param {string} buttonId
	 * @param {string} id
	 */
	setCustomId(buttonId, id) {
		this.getButton( buttonId ).setCustomId( id );
		return this;
	}
	
	/**
	 * @name setStyle
	 * @description update button style
	 * @param {string} buttonId
	 * @param {ButtonStyle} style
	 */
	setStyle(buttonId, style) {
		this.getButton( buttonId ).setStyle( style );
		return this;
	}
	
	/**
	 * @name removeButton
	 * @description Remove the button from the button list
	 * @param {string} buttonId
	 * @return {{buttonId: *, buttons: *}}
	 */
	removeButton(buttonId) {
		const buttonIndex = this.#getButtonIndex( buttonId );
		return {
			buttonId: this.#buttons.buttonId.slice( 0, buttonIndex ).concat( this.#buttons.buttonId.slice( buttonIndex + 1 ) ),
			button: this.#buttons.button.slice( 0, buttonIndex ).concat( this.#buttons.button.slice( buttonIndex + 1 ) ),
		};
	}
	
	/**
	 * @name next
	 * @description Get the next page
	 * @return {{components: *[], embeds: *[]}}
	 */
	next() {
		if (this.#currPageNumber < this.#totalPage) this.#currPageNumber++;
		if (this.#currPageNumber === this.#totalPage) {
			this.#currPage = page.last;
		} else {
			this.#currPage = page.middle;
		}
		
		return this.render();
	}
	
	/**
	 * @name previous
	 * @description Get the previous page
	 * @return {{components: *[], embeds: *[]}}
	 */
	previous() {
		if (this.#currPageNumber) this.#currPageNumber--;
		if (!this.#currPageNumber) {
			this.#currPage = page.first;
		} else {
			this.#currPage = page.middle;
		}
		return this.render();
	}
	
	/**
	 * @name disablePrevious
	 * @description Disable the next button
	 */
	#disablePrevious(label) {
		if (label === true) {
			this.getButton( button.previous ).setDisabled( true ).setLabel( `${this.#currPageNumber + 1}/${this.#totalPage + 1}` );
		} else if (label) {
			this.getButton( button.previous ).setDisabled( true ).setLabel( label );
		} else {
			this.getButton( button.previous ).setDisabled( true );
		}
	}
	
	/**
	 * @name enablePrevious
	 * @description Enable the next button
	 */
	#enablePrevious(label) {
		if (label === true) {
			this.getButton( button.previous ).setDisabled( false ).setLabel( `${this.#currPageNumber}/${this.#totalPage + 1}` );
		} else if (label) {
			this.getButton( button.previous ).setDisabled( false ).setLabel( label );
		} else {
			this.getButton( button.previous ).setDisabled( false );
		}
	}
	
	/**
	 * @name disableNext
	 * @description Disable the next button
	 */
	#disableNext(label) {
		if (label === true) {
			this.getButton( button.next ).setDisabled( true ).setLabel( `${this.#currPageNumber + 1}/${this.#totalPage + 1}` );
		} else if (label) {
			this.getButton( button.next ).setDisabled( true ).setLabel( label );
		} else {
			this.getButton( button.next ).setDisabled( true );
		}
	}
	
	/**
	 * @name enableNext
	 * @description Disable the next button
	 */
	#enableNext(label) {
		if (label === true) {
			this.getButton( button.next ).setDisabled( false ).setLabel( `${this.#currPageNumber + 2}/${this.#totalPage + 1}` );
		} else if (label) {
			this.getButton( button.next ).setDisabled( false ).setLabel( label );
		} else {
			this.getButton( button.next ).setDisabled( false );
		}
	}
	
	/**
	 * @name updateButtons
	 * @description Display the next, previous and current_page buttons
	 * @param {Object[]} arrayFields
	 */
	updateButtons() {
		let buttons_bak = this.#buttons, start, end, menu;
		
		if (this.buttonExist( button.current_page )) {
			if (this.#displayCurrentPageInfo) {
				this.setLabel( button.current_page, `${this.#currPageNumber + 1}/${this.#totalPage + 1}` );
				
			} else {
				this.#buttons = this.removeButton( button.current_page );
				
			}
		}
		
		if (this.#currPage === page.middle) {
			this.#enablePrevious( this.#countOnbutton );
			this.#enableNext( this.#countOnbutton );
			
			
		} else if (!this.#totalPage) { /* only one page */
			this.removeButton( button.next );
			this.removeButton( button.previous );
			this.#disableNext();
			this.#disablePrevious();
			
		} else if (this.#currPage === page.first) {
			
			this.#disablePrevious( this.#countOnbutton );
			this.#enableNext( this.#countOnbutton );
			
			
		} else if (this.#currPage === page.last) {
			
			this.#disableNext( this.#countOnbutton );
			this.#enablePrevious( this.#countOnbutton );
			
			
		}
		
		this.actionRow.setComponents( this.#buttons.button );
		this.#buttons = buttons_bak;
	}
	
	elementsToDisplay(arrayFields, arrayOptions) {
		let slicedArray, slicedMenu, start, end;
		
		start = this.#currPageNumber * this.itemPerPage;
		end = this.#currPageNumber * this.itemPerPage + this.itemPerPage;
		end = end > this.#item_count ? this.#item_count : end;
		
		if (arrayOptions) slicedMenu = arrayOptions.slice( start, end );
		if (arrayFields) slicedArray = arrayFields.slice( start, end );
		return [slicedArray, slicedMenu];
	}
	
	/**
	 * @name render
	 * @description Render the embed
	 * @return {[Array, Array]}
	 */
	render() {
		this.checker();
		this.updateButtons();
		return this.elementsToDisplay( this.arrayFields, this.arrayOptions );
	}
	
	/**
	 * Check if all fields are provided
	 */
	checker() {
		// if (!this.arrayFields) throw new Error( 'Missing arrayFields parameter (this.setFields)' );
		// if (!this.arrayOptions) throw new Error( 'Missing arrayOptions parameter (this.setOptions)' );
		//if (this.selectMenu && !this.selectMenu.options.length) throw new Error( 'Missing options with selectMenu parameter ( SelectMenuBuilder().setOptions() )' );
		if (!this.arrayFields && !this.selectMenu) throw new Error( 'Missing selectMenu or arrayFields parameter ( this.setSelectMenu) || (this.setArrayFields() )' );
		if (!this.arrayFields && !this.selectMenu) throw new Error( 'Define a menu and/or an array parameter ( ( this.setSelectMenu() && this.setOptions() ) || this.setFields() )' );
		if (!this.arrayFields && !this.arrayOptions) throw new Error( 'Define arrayFields or arrayOptions parameter ( this.setOptions || this.setFields() )' );
		if (this.arrayFields && this.arrayOptions && this.arrayFields.length !== this.arrayOptions.length) throw new Error( `arrayFields ( length=${this.arrayFields.length} ) and arrayOptions ( length=${this.arrayOptions.length} ) must have the same length` );
		if (!this.#buttons) throw new Error( `Missing buttons parameter ( this.setButtons() )` );
		if (!this.itemPerColumn) throw new Error( 'Missing columnCount parameter ( this.setColumnCount() )' );
		if (!this.itemPerRow) throw new Error( 'Missing rowCount parameter ( this.setRowCount() )' );
	}
};