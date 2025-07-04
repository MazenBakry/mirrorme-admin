export async function deleteProductFromModel(ml_id: number) {
  try {
    await fetch(`${process.env.SIMILARITY_MODEL_URL}/api/v1/items/${ml_id}`, {
      method: "DELETE",
    });
    await fetch(
      `${process.env.COMPATIBILITY_MODEL_URL}/api/v1/items/${ml_id}`,
      { method: "DELETE" }
    );
    await fetch(`${process.env.OUTFIT_Model_URL}/api/v1/items/${ml_id}`, {
      method: "DELETE",
    });
    console.log("deleted from models");
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function addProductToModel(formData: FormData) {
  try {
    await fetch(`${process.env.SIMILARITY_MODEL_URL}/api/v1/items`, {
      method: "POST",
      body: formData,
    });
    await fetch(`${process.env.COMPATIBILITY_MODEL_URL}/api/v1/items`, {
      method: "POST",
      body: formData,
    });
    await fetch(`${process.env.OUTFIT_Model_URL}/api/v1/items`, {
      method: "POST",
      body: formData,
    });
    console.log("add to models");
  } catch (error) {
    console.log(error);
    throw error;
  }
}
