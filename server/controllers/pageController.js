/**
 * Page Controller
 * Static pages that don't touch the database
 */

const Category = require( "../models/Category" );
const Recipe = require( "../models/Recipe" );
const catchAsync = require( "../utils/catchAsync" );
const { titleFun } = require( "../utils/helpers" );

exports.indexPage = catchAsync( async ( req, res ) => {
  const limit = 6;
  const categories = await Category.find( {} ).limit( limit );
  const recipes = await Recipe.find( {} ).sort( { _id: -1 } ).limit( limit );
  res.render( "index", { title: titleFun( "Home" ), categories, recipes } );

  // res.render( "index", { title: titleFun( "Home" ) } );
} );

exports.aboutPage = catchAsync( async ( req, res ) => {
  res.render( "about", { title: titleFun( "About" ) } );
} );

exports.contactPage = catchAsync( async ( req, res ) => {
  res.render( "contact", { title: titleFun( "Contact" ) } );
} );

exports.errorPage = catchAsync( async ( req, res ) => {
  res.status( 404 ).render( "404", { title: titleFun( "404" ) } );
} );