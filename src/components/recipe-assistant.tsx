"use client";

interface RecipeAssistantProps {
  ingredients: string[];
}

export const RecipeAssistant: React.FC<RecipeAssistantProps> = ({ ingredients }) => {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Recipe Assistant</h2>
      {ingredients.length > 0 ? (
        <div>
          <p className="mb-2">Identified Ingredients: {ingredients.join(', ')}</p>
          {/* TODO: Implement AI-powered recipe suggestion and step-by-step instructions here */}
          <p className="text-sm text-muted-foreground">AI is suggesting recipes based on the identified ingredients...</p>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No ingredients identified yet. Please use the Ingredient Identifier first.</p>
      )}
    </div>
  );
};
