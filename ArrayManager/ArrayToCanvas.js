const {ActionRowBuilder, SelectMenuBuilder, AttachmentBuilder} = require( 'discord.js' );
const {ArrayManager} = require( './index' );
const Canvas = require( 'canvas' );

/**
 * @name Corner
 * @description Corner indicator
 * @type {{bottomLeft: string, bottomRight: string, topLeft: string, topRight: string}}
 */
const Corner = {
	topLeft: 'TOP_LEFT',
	topRight: 'TOP_RIGHT',
	bottomLeft: 'BOT_LEFT',
	bottomRight: 'BOT_RIGHT',
};


/**
 * @author 🅣 🅞 🅚 🅐#9652
 * @class
 * @name ArrayToCanvas
 * @extends ArrayManager
 * @exports ArrayToEmbed
 * @description Create an embed from an arrayFields /!\ WIP
 * @example
 *
 */
class ArrayToCanvas extends ArrayManager {
	/** Canvas */
	#backgroundCanvas;
	
	/** Container */
	#containerWidth;
	#containerHeight;
	#containerXOffset = 0;
	#containerYOffset = 0;
	
	/** Item */
	#canvasItem = new CanvasItem();
	#itemWidth;
	#itemHeight;
	#halfItemXSpacing;
	#halfItemYSpacing;
	
	constructor() {super();}
	
	/**
	 * @name setContainerWidth
	 * @description Container width
	 * @param {number} containerWidth
	 * @return {ArrayToCanvas}
	 */
	setContainerWidth(containerWidth) {
		this.#containerWidth = containerWidth;
		return this;
	}
	
	/**
	 * @name setContainerHeight
	 * @description Container height
	 * @param {number} containerHeight
	 * @return {ArrayToCanvas}
	 */
	setContainerHeight(containerHeight) {
		this.#containerHeight = containerHeight;
		return this;
	}
	
	/**
	 * @name setContainerXOffset
	 * @description The container X offset
	 * @param {number} containerXOffset
	 * @return {ArrayToCanvas}
	 */
	setContainerXOffset(containerXOffset) {
		this.#containerXOffset = containerXOffset;
		return this;
	}
	
	/**
	 * @name setContainerYOffset
	 * @description The container Y offset
	 * @param {number} containerYOffset
	 * @return {ArrayToCanvas}
	 */
	setContainerYOffset(containerYOffset) {
		this.#containerYOffset = containerYOffset;
		return this;
	}
	
	/**
	 * @name setBackgroundCanvas
	 * @description The Canvas
	 * @param {Canvas} backgroundCanvas
	 * @return {ArrayToCanvas}
	 */
	setBackgroundCanvas(backgroundCanvas) {
		this.#backgroundCanvas = backgroundCanvas;
		return this;
	}
	
	/**
	 * @name setCanvasItem
	 * @description Canvas fields parameter
	 * @return {CanvasItem}
	 */
	setCanvasItem() {
		return this.#canvasItem;
	}
	
	getContext() {
		return this.#backgroundCanvas.getContext( '2d' );
	}
	
	/**
	 * @name getItemSize
	 * @description Item size (Width & Height)
	 */
	#getItemParameters() {
		this.#itemWidth = this.#containerWidth / this.itemPerRow - this.#canvasItem.itemXSpacing;
		this.#itemHeight = this.#containerHeight / this.itemPerColumn - this.#canvasItem.itemYSpacing;
		this.#halfItemXSpacing = this.#canvasItem.itemXSpacing * 0.5;
		this.#halfItemYSpacing = this.#canvasItem.itemYSpacing * 0.5;
	}
	
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
	 * @name renderEmbed
	 * @description Render the embed
	 * @return {{tts: boolean, components: *[], files: *[], ephemeral: (boolean|*), embeds: *[], content: null}}
	 */
	render() {
		this.checker();
		this.#getItemParameters();
		const elementsToDisplay = super.render();
		
		let canvas = Canvas.createCanvas( this.#backgroundCanvas.width, this.#backgroundCanvas.height, 'png' );
		let context = canvas.getContext( '2d' );
		context.drawImage( this.#backgroundCanvas, 0, 0 );
		
		elementsToDisplay[0].forEach( (item, i) => this.#drawItem( item, context, i ) );
		
		return {
			tts: false,
			content: null,
			files: [new AttachmentBuilder( canvas.createPNGStream( {compressionLevel: 4} ) )],
			components: [this.actionRow].concat( this.selectMenu ? this.#createMenu( elementsToDisplay[1] ) : [] ),
			embeds: [],
			ephemeral: this.ephemeral,
		};
	}
	
	checker() {
		super.checker();
		if (!this.#containerHeight) throw new Error( 'Missing container (this.setContainerHeight)' );
		if (!this.#containerWidth) throw new Error( 'Missing container (this.setContainerWidth)' );
		if (isNaN( this.#containerXOffset )) throw new Error( 'Missing container (this.setContainerXOffset)' );
		if (isNaN( this.#containerYOffset )) throw new Error( 'Missing container (this.setContainerYOffset)' );
		if (isNaN( this.#canvasItem.itemXSpacing )) throw new Error( 'Missing itemXSpacing (this.setCanvasItem)' );
		if (isNaN( this.#canvasItem.itemYSpacing )) throw new Error( 'Missing itemXSpacing (this.setCanvasItem)' );
		if (!this.#canvasItem.gradientCorner) throw new Error( 'Missing gradientCorner (this.setCanvasItem)' );
		if (!this.#canvasItem.gradientMainColor) throw new Error( 'Missing gradientMainColor (this.setCanvasItem)' );
		if (!this.#canvasItem.gradientSecondaryColor) throw new Error( 'Missing gradientSecondaryColor (this.setCanvasItem)' );
	}
	
	
	/**
	 * @name #drawItem
	 * @description Draws the item field into the canvas
	 * @param {Object} item item object
	 * @param {getContext} context cancas context
	 * @param {number} i field index
	 */
	#drawItem(item, context, i) {
		
		/** Item position coordinates (Row & Column) */
		const itemRowID = Math.floor( i / this.itemPerRow );
		const itemColID = Math.floor( i % this.itemPerRow );
		
		/**
		 * @name itemTopCoords
		 * @description Item top border (Y)
		 * @type {number}
		 */
		const itemTopCoords = this.#containerYOffset + this.#itemHeight * itemRowID + this.#canvasItem.itemYSpacing * itemRowID + this.#halfItemYSpacing;
		/**
		 * @name itemLeftCoords
		 * @description Item left border (X)
		 * @type {number}
		 */
		const itemLeftCoords = this.#containerXOffset + this.#itemWidth * itemColID + this.#canvasItem.itemXSpacing * itemColID + this.#halfItemXSpacing;
		/**
		 * @name itemRightCoords
		 * @description Item right border (X)
		 * @type {number}
		 */
		const itemRightCoords = itemLeftCoords + this.#itemWidth;
		/**
		 * @name itemBottomCoords
		 * @description Item bottom border (Y)
		 * @type {number}
		 */
		const itemBottomCoords = itemTopCoords + this.#itemHeight;
		
		/** Item container gradient side */
		switch (this.#canvasItem.gradientCorner) {
			case Corner.topLeft:
				context.fillStyle = context.createLinearGradient( itemLeftCoords, itemTopCoords, itemRightCoords, itemBottomCoords );
				break;
			case Corner.topRight:
				context.fillStyle = context.createLinearGradient( itemRightCoords, itemTopCoords, itemLeftCoords, itemBottomCoords );
				break;
			case Corner.bottomLeft:
				context.fillStyle = context.createLinearGradient( itemLeftCoords, itemBottomCoords, itemRightCoords, itemTopCoords );
				break;
			case Corner.bottomRight:
				context.fillStyle = context.createLinearGradient( itemRightCoords, itemBottomCoords, itemLeftCoords, itemTopCoords );
				break;
		}
		
		/** Item container gradient color */
		context.fillStyle.addColorStop( 0, this.#canvasItem.gradientMainColor );
		context.fillStyle.addColorStop( 1, this.#canvasItem.gradientSecondaryColor );
		
		/** Item container box */
		context.fillRect( itemLeftCoords, itemTopCoords, this.#itemWidth, this.#itemHeight );
		
		/** Make the image fill the container */
		let ratio, imgWidth, imgHeight;
		if (this.#itemHeight > this.#itemWidth) {
			ratio = this.#itemWidth / item.canvasImg.width;
			imgWidth = item.canvasImg.width * ratio;
			imgHeight = item.canvasImg.height * ratio;
		} else {
			ratio = this.#itemHeight / item.canvasImg.height;
			imgWidth = item.canvasImg.width * ratio;
			imgHeight = item.canvasImg.height * ratio;
		}
		
		/** Draws the image at the center */
		context.drawImage( item.canvasImg, itemLeftCoords + this.#itemWidth * 0.5 - imgWidth * 0.5, itemTopCoords + this.#itemHeight * 0.5 - imgHeight * 0.5, imgWidth, imgHeight );
		
		this.#canvasItem.fields.forEach( field => {
			
			/** Item side placement and alignement */
			let textCoords,
				extraXSpacing = field.align === 'center' ? this.#itemWidth / 2 : 0;
			switch (field.corner) {
				case Corner.topLeft:
					context.textAlign = field.align || 'start';
					context.textBaseline = field.baseLine || 'top';
					textCoords = [itemLeftCoords + field.marginX + extraXSpacing, itemTopCoords + field.marginY];
					break;
				case Corner.topRight:
					context.textAlign = field.align || 'end';
					context.textBaseline = field.baseLine || 'top';
					textCoords = [itemRightCoords + field.marginX - extraXSpacing, itemTopCoords + field.marginY];
					break;
				case Corner.bottomLeft:
					context.textAlign = field.align || 'start';
					context.textBaseline = field.baseLine || 'bottom';
					textCoords = [itemLeftCoords + field.marginX + extraXSpacing, itemBottomCoords + field.marginY];
					break;
				case Corner.bottomRight:
					context.textAlign = field.align || 'end';
					context.textBaseline = field.baseLine || 'bottom';
					textCoords = [itemRightCoords + field.marginX - extraXSpacing, itemBottomCoords + field.marginY];
					break;
			}
			/** Applies the text font and style */
			context.fillStyle = field.color;
			context.font = field.font;
			context.strokeStyle = field.strokeColor;
			context.lineWidth = field.strokeWidth;
			context.textBaseline = field.baseLine;
			context.textAlign = context.textAlign || 'start';
			
			let text = item[field.name];
			
			/** Crop the text */
			if (field.maxWidth) {
				let textWidth = context.measureText( text ).width;
				let toRemove;
				if (field.maxWidth === 'parent' && textWidth > (this.#itemWidth - field.marginX)) {
					textWidth = textWidth + Math.abs( field.marginX );
					toRemove = Math.floor( text.length - 2 - (textWidth - this.#itemWidth + field.marginX) / (textWidth / text.length) );
					text = text.slice( 0, toRemove ) + '...';
					
				} else if (!isNaN( field.maxWidth ) && textWidth > field.maxWidth) {
					toRemove = Math.floor( text.length - 2 - (textWidth - field.maxWidth) / (textWidth / text.length) );
					text = text.slice( 0, toRemove ) + '...';
				}
			}
			
			/** Writes the text on the field */
			if (field.stroke) context.strokeText( text, ...textCoords );
			context.fillText( text, ...textCoords );
		} );
	}
}

class CanvasItem {
	itemXSpacing = 0;
	itemYSpacing = 0;
	gradientMainColor = '#2f3944';
	gradientSecondaryColor = '#455467';
	gradientCorner = Corner.bottomLeft;
	strokeText = true;
	fields;
	
	/**
	 * @name setFields
	 * @description Text displayed for each field
	 *
	 * @param {Array.<{
	 * name: string,
	 * font: string,
	 * color: string,
	 * marginX: number,
	 * marginY: number,
	 * maxWidth: 'parent' | number,
	 * corner: Corner | 'TOP_LEFT' | 'TOP_RIGHT' | 'BOT_LEFT' | 'BOT_RIGHT',
	 * baseLine: 'top' | 'hanging' | 'middle' | 'alphabetic' | 'ideographic' | 'bottom',
	 * align: 'start' | 'end' | 'left' | 'right' | 'center' | 'justify' | 'match-parent' | 'justify-all',
	 * strokeWidth: number,
	 * stroke: boolean,
	 * strokeColor: string,
	 * }>} fields Name is the object setFields key name
	 *
	 * @return {CanvasItem}
	 */
	setFields(fields) {
		this.fields = fields.map( field => {
			if (!field.name) throw new Error( 'Item field name is missing' );
			return {
				name: field.name,
				font: field.font || '20px sans-serif',
				color: field.color || '#FFFFFF',
				marginX: field.marginX || 0,
				marginY: field.marginY || 0,
				maxWidth: field.maxWidth,
				corner: field.corner || Corner.topLeft,
				baseLine: field.baseLine,
				align: field.align,
				stroke: field.stroke,
				strokeColor: field.strokeColor || '#000000',
				strokeWidth: field.strokeWidth || 3,
			};
		} );
		return this;
	}
	
	/**
	 * @name setStrokeText
	 * @description Stroke the text
	 * @param {boolean} strokeText
	 * @return {CanvasItem}
	 */
	setStrokeText(strokeText) {
		this.strokeText = strokeText;
		return this;
	}
	
	/**
	 * @name setItemXSpacing
	 * @description Item X spacing pixels count
	 * @param {number} itemXSpacing
	 * @return {CanvasItem}
	 */
	setItemXSpacing(itemXSpacing) {
		this.itemXSpacing = itemXSpacing;
		return this;
	}
	
	/**
	 * @name setItemYSpacing
	 * @description Item Y spacing pixels count
	 * @param {number} itemYSpacing
	 * @return {CanvasItem}
	 */
	setItemYSpacing(itemYSpacing) {
		this.itemYSpacing = itemYSpacing;
		return this;
	}
	
	/**
	 * @name gradientMainColor
	 * @description Define the corner at which the gradient starts
	 * @param {Corner | 'TOP_LEFT' | 'TOP_RIGHT' | 'BOT_LEFT' | 'BOT_RIGHT'} gradientCorner The corner
	 * @return {CanvasItem}
	 */
	setGradientCorner(gradientCorner) {
		this.gradientCorner = gradientCorner;
		return this;
	}
	
	/**
	 * @name gradientMainColor
	 * @description Gradient main color
	 * @param {String} gradientMainColor Hex color
	 * @return {CanvasItem}
	 */
	setGradientMainColor(gradientMainColor) {
		this.gradientMainColor = gradientMainColor;
		return this;
	}
	
	/**
	 * @name setGradientSecondaryColor
	 * @description Gradient secondary color
	 * @param {String} gradientSecondaryColor Hex color
	 * @return {CanvasItem}
	 */
	setGradientSecondaryColor(gradientSecondaryColor) {
		this.gradientSecondaryColor = gradientSecondaryColor;
		return this;
	}
}

module.exports = {
	ArrayToCanvas,
	Corner,
};
