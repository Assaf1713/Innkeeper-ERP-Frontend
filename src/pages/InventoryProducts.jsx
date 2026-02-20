import { useEffect, useState, useMemo } from "react";
import {
  fetchInventoryProducts,
  deleteInventoryProduct,
  updateInventoryProduct,
} from "../api/inventoryProductsApi";
import FilterPanel, {
  FilterSearch,
  FilterActions,
  FilterChooseEntryLimit,
} from "../components/FilterPanel";
import NewInventoryProductModal from "../components/forms/NewInventoryProductModal";
import ChangeVATModal from "../components/forms/ChangeVATModal";
import EditableCell from "../components/EditableCell";
import { useAlert } from "../hooks/useAlert";
import {getCurrentVAT} from "../api/settingsApi";

export default function InventoryProducts() {
  const { showSuccess, showError } = useAlert();
  const [inventoryProducts, setInventoryProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [entryLimit, setEntryLimit] = useState(20);
  const [showNewProductModal, setShowNewProductModal] = useState(false);
  const [showVATModal, setShowVATModal] = useState(false);
  const [currentVAT, setCurrentVAT] = useState(null);

  useEffect(() => {
    const loadInventoryProducts = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await fetchInventoryProducts();
        setInventoryProducts(data.inventoryProducts || []);
      } catch (err) {
        console.error(err);
        setError("שגיאה בטעינת המוצרים. אנא נסה שוב מאוחר יותר.");
      } finally {
        setLoading(false);
      }
    };

    loadInventoryProducts();
    const loadCurrentVAT = async () => {
      try {
        const vat = await getCurrentVAT();
        setCurrentVAT(vat);
      } catch (err) {
        console.error("Error loading current VAT:", err);
      }
    };
    loadCurrentVAT();
  }, []);

  const filteredProducts = useMemo(() => {
    return inventoryProducts.filter((product) => {
      if (!searchQuery) return true;

      const query = searchQuery.toLowerCase();
      return product.label?.toLowerCase().includes(query);
    });
  }, [inventoryProducts, searchQuery]);

  const displayedProducts = useMemo(() => {
    if (entryLimit === "all") return filteredProducts;
    return filteredProducts.slice(0, entryLimit);
  }, [filteredProducts, entryLimit]);

  const handleClearFilters = () => {
    setSearchQuery("");
  };

  const handleDeleteProduct = async (id) => {
    try {
      await deleteInventoryProduct(id);
      setInventoryProducts((prev) =>
        prev
          .map((product) =>
            product._id === id ? { ...product, isActive: false } : product
          )
          .sort((a, b) => {
            if (a.isActive === b.isActive) return 0;
            return a.isActive ? -1 : 1;
          })
      );
      showSuccess("המוצר הושבת בהצלחה");
    } catch (err) {
      console.error("Error deleting product:", err);
      showError("שגיאה במחיקת המוצר. אנא נסה שוב.");
    }
  };

  const handleReActivate = async (id) => {
    try {
      await updateInventoryProduct(id, { isActive: true });
      setInventoryProducts((prev) =>
        prev
          .map((product) =>
            product._id === id ? { ...product, isActive: true } : product
          )
          .sort((a, b) => {
            if (a.isActive === b.isActive) return 0;
            return a.isActive ? -1 : 1;
          })
      );
      showSuccess("המוצר הופעל בהצלחה");
    } catch (err) {
      console.error("Error reactivating product:", err);
      showError("שגיאה בהחזרת המוצר לפעיל. אנא נסה שוב.");
    }
  };

  const handleUpdateProduct = async (id, field, value) => {
    try {
      const updatedProduct = await updateInventoryProduct(id, {
        [field]: value,
      });
      setInventoryProducts((prev) =>
        prev.map((product) =>
          product._id === id
            ? { ...product, ...updatedProduct }
            : product
        )
      );
      showSuccess("המוצר עודכן בהצלחה");
    } catch (err) {
      console.error("Error updating product:", err);
      showError("שגיאה בעדכון המוצר. אנא נסה שוב.");
    }
  };

  const handleCreateNewProduct = (newProduct) => {
    setInventoryProducts((prev) => [...prev, newProduct]);
  };

  if (loading) return <div className="page-loading">טוען...</div>;
  if (error) return <div className="page-error">{error}</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>ניהול מוצרים במלאי</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setShowNewProductModal(true)}
          >
            + מוצר חדש
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setShowVATModal(true)}
          >
            עדכון מע"מ
          </button>
        </div>
      </div>

      <FilterPanel>
        <FilterSearch
          value={searchQuery}
          onChange={(value) => setSearchQuery(value)}
          placeholder="חיפוש לפי שם מוצר..."
        />
        <FilterChooseEntryLimit
          value={entryLimit}
          onChange={(value) =>
            setEntryLimit(value === "all" ? "all" : Number(value))
          }
        />
        <FilterActions onClear={handleClearFilters} />
      </FilterPanel>

      <div className="table-info">
        מציג {displayedProducts.length} מתוך {filteredProducts.length} מוצרים
      </div>

      <div className="table-container">
        <div className="table-wrapper">
          <table className="global-table">
            <thead>
              <tr>
                <th>שם מוצר</th>
                <th>קטגוריה</th>
                <th>מחיר כולל מע"מ</th>
                <th>מחיר לפני מע"מ</th>
                <th>פעיל</th>
                <th>פעולות</th>
              </tr>
            </thead>
            <tbody>
              {displayedProducts.map((product) => (
                <tr
                  key={product._id}
                  className={!product.isActive ? "customer-row--inactive" : ""}
                >
                  <td>{product.label}</td>
                  <td>{product.category || "-"}</td>
                  <td>
                    <EditableCell
                      value={product.price}
                      onSave={(value) =>
                        handleUpdateProduct(product._id, "price", value)
                      }
                    />
                  </td>
                  <td>
                    <EditableCell
                      value={product.netPrice}
                      onSave={(value) =>
                        handleUpdateProduct(product._id, "netPrice", value)
                      }
                    />
                  </td>
                  <td>{product.isActive ? "כן" : "לא"}</td>
                  <td>
                    {product.isActive ? (
                      <button
                        className="global-table__btn ui-btn--delete_item"
                        onClick={() => handleDeleteProduct(product._id)}
                      >
                        מחק
                      </button>
                    ) : (
                      <button
                        className="global-table__btn ui-btn--edit_item"
                        onClick={() => handleReActivate(product._id)}
                      >
                        החזר לפעיל
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {displayedProducts.length === 0 && (
          <div className="no-results">לא נמצאו מוצרים</div>
        )}
      </div>

      {showNewProductModal && (
        <NewInventoryProductModal
          onClose={() => setShowNewProductModal(false)}
          onCreated={handleCreateNewProduct}
        />
      )}

      {showVATModal && (
        <ChangeVATModal
          onClose={() => setShowVATModal(false)}
          onSuccess={() => {
            setShowVATModal(false);
            // Reload products to show updated prices
            window.location.reload();
          }}
          currentVAT={currentVAT}
        />
      )}
    </div>
  );
}
