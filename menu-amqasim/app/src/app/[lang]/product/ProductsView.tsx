import { getViewStyle } from "@/utils/theme";
import GridView from "./GridView";
import ListView from "./ListView";
import ImageView from "./ImageView";

async function ProductsView() {
   const view_style = await getViewStyle();
   return (
      <div className="products-view">
         {view_style === "GRID" && <GridView />}
         {view_style === "LIST" && <ListView />}
         {view_style === "IMAGE" && <ImageView />}
      </div>
   );
}

export default ProductsView;
