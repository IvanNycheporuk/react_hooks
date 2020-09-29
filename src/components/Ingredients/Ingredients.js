import React, { useEffect, useCallback, useReducer, useMemo } from 'react';

import IngredientForm from './IngredientForm';
import IngredientList from './IngredientList';
import Search from './Search';
import ErrorModal from '../UI/ErrorModal';
import useHttp from '../../hooks/http';

const ingredientReducer = (currentIngredients, action) => {
  switch (action.type) {
    case 'SET':
      return action.ingredients;
    case 'ADD':
      return [...currentIngredients, action.ingredient]
    case 'DELETE':
      return currentIngredients.filter( ing => ing.id !== action.id);
    default:
      throw new Error('Not valid option')
  }
}

const Ingredients = () => {
  const [ingredients, dispatch] = useReducer(ingredientReducer, []);
  const { isLoading, error, data, sendRequest, reqExtra, reqIdentifier, clear} = useHttp();

  useEffect(() => {
    if (!isLoading && !error && reqIdentifier === 'REMOVE_INGREDIENT') {
      dispatch({ type: 'DELETE', id: reqExtra} );
    } else if (!isLoading && !error && reqIdentifier === 'ADD_INGREDIENT') {
      dispatch({type: 'ADD', ingredient: { id: data.name, ...reqExtra }})
    }
    
  }, [data, reqExtra, reqIdentifier, isLoading]);

  const filteredIngredientsHandler = useCallback(filteredIngs => {
    dispatch({ type: 'SET', ingredients: filteredIngs });
  }, [])

  const addIngredientHandler = useCallback((ingredient) => {
    sendRequest(
      'https://react-hooks-959bd.firebaseio.com/ingredients.json', 
      'POST',
      JSON.stringify(ingredient),
      ingredient,
      'ADD_INGREDIENT'
    );
  }, [sendRequest])

  const removeIngredientHandler = useCallback((id) => {
    sendRequest(
      `https://react-hooks-959bd.firebaseio.com/ingredients/${id}.json`, 
      'DELETE',
      null,
      id,
      'REMOVE_INGREDIENT'
    );
  }, [sendRequest]);

  const ingredientList = useMemo(() => (
    <IngredientList 
      ingredients={ ingredients }
      onRemoveItem={ removeIngredientHandler } 
    />
  ), [ingredients, removeIngredientHandler])

  return (
    <div className="App">
      { error && <ErrorModal onClose={ clear }>{ error }</ErrorModal> }
      <IngredientForm 
        onAddIngredient = { addIngredientHandler } 
        loading={ isLoading }
      />
      <section>
        <Search onLoadIngredients={ filteredIngredientsHandler } />
        { ingredientList }
      </section>
    </div>
  );
}

export default Ingredients;
