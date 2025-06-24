"use client"

import type React from "react"
import { createContext, useContext, useReducer, useEffect } from "react"
import type { Product } from "@/lib/types"

export interface CartItem {
  product: Product
  quantity: number
  selected: boolean
}

interface CartState {
  items: CartItem[]
  isLoading: boolean
}

type CartAction =
  | { type: "ADD_TO_CART"; payload: { product: Product; quantity: number } }
  | { type: "REMOVE_FROM_CART"; payload: { productId: number } }
  | { type: "UPDATE_QUANTITY"; payload: { productId: number; quantity: number } }
  | { type: "TOGGLE_SELECT"; payload: { productId: number } }
  | { type: "SELECT_ALL"; payload: { selected: boolean } }
  | { type: "CLEAR_CART" }
  | { type: "LOAD_CART"; payload: { items: CartItem[] } }
  | { type: "SET_LOADING"; payload: { isLoading: boolean } }

interface CartContextType {
  state: CartState
  addToCart: (product: Product, quantity: number) => Promise<void>
  removeFromCart: (productId: number) => Promise<void>
  updateQuantity: (productId: number, quantity: number) => Promise<void>
  toggleSelect: (productId: number) => void
  selectAll: (selected: boolean) => void
  clearCart: () => Promise<void>
  getCartTotal: () => number
  getSelectedTotal: () => number
  getSelectedCount: () => number
  getTotalItems: () => number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_TO_CART": {
      const existingItemIndex = state.items.findIndex(
        (item) => item.product.product_id === action.payload.product.product_id,
      )

      if (existingItemIndex >= 0) {
        const updatedItems = [...state.items]
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + action.payload.quantity,
        }
        return { ...state, items: updatedItems }
      }

      return {
        ...state,
        items: [
          ...state.items,
          {
            product: action.payload.product,
            quantity: action.payload.quantity,
            selected: true,
          },
        ],
      }
    }

    case "REMOVE_FROM_CART":
      return {
        ...state,
        items: state.items.filter((item) => item.product.product_id !== action.payload.productId),
      }

    case "UPDATE_QUANTITY": {
      const updatedItems = state.items.map((item) =>
        item.product.product_id === action.payload.productId
          ? { ...item, quantity: Math.max(1, action.payload.quantity) }
          : item,
      )
      return { ...state, items: updatedItems }
    }

    case "TOGGLE_SELECT": {
      const updatedItems = state.items.map((item) =>
        item.product.product_id === action.payload.productId ? { ...item, selected: !item.selected } : item,
      )
      return { ...state, items: updatedItems }
    }

    case "SELECT_ALL":
      return {
        ...state,
        items: state.items.map((item) => ({ ...item, selected: action.payload.selected })),
      }

    case "CLEAR_CART":
      return { ...state, items: [] }

    case "LOAD_CART":
      return { ...state, items: action.payload.items }

    case "SET_LOADING":
      return { ...state, isLoading: action.payload.isLoading }

    default:
      return state
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    isLoading: false,
  })

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("aims-cart")
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart) as CartItem[]
        dispatch({ type: "LOAD_CART", payload: { items: parsedCart } })
      } catch (error) {
        console.error("Failed to load cart from localStorage:", error)
      }
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("aims-cart", JSON.stringify(state.items))
  }, [state.items])

  const addToCart = async (product: Product, quantity: number): Promise<void> => {
    dispatch({ type: "SET_LOADING", payload: { isLoading: true } })

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 300))

    dispatch({ type: "ADD_TO_CART", payload: { product, quantity } })
    dispatch({ type: "SET_LOADING", payload: { isLoading: false } })
  }

  const removeFromCart = async (productId: number): Promise<void> => {
    dispatch({ type: "SET_LOADING", payload: { isLoading: true } })

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 200))

    dispatch({ type: "REMOVE_FROM_CART", payload: { productId } })
    dispatch({ type: "SET_LOADING", payload: { isLoading: false } })
  }

  const updateQuantity = async (productId: number, quantity: number): Promise<void> => {
    if (quantity < 1) return

    dispatch({ type: "SET_LOADING", payload: { isLoading: true } })

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 200))

    dispatch({ type: "UPDATE_QUANTITY", payload: { productId, quantity } })
    dispatch({ type: "SET_LOADING", payload: { isLoading: false } })
  }

  const toggleSelect = (productId: number): void => {
    dispatch({ type: "TOGGLE_SELECT", payload: { productId } })
  }

  const selectAll = (selected: boolean): void => {
    dispatch({ type: "SELECT_ALL", payload: { selected } })
  }

  const clearCart = async (): Promise<void> => {
    dispatch({ type: "SET_LOADING", payload: { isLoading: true } })

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 300))

    dispatch({ type: "CLEAR_CART" })
    dispatch({ type: "SET_LOADING", payload: { isLoading: false } })
  }

  const getCartTotal = (): number => {
    return state.items.reduce((total, item) => total + item.product.price * item.quantity, 0)
  }

  const getSelectedTotal = (): number => {
    return state.items
      .filter((item) => item.selected)
      .reduce((total, item) => total + item.product.price * item.quantity, 0)
  }

  const getSelectedCount = (): number => {
    return state.items.filter((item) => item.selected).length
  }

  const getTotalItems = (): number => {
    return state.items.reduce((total, item) => total + item.quantity, 0)
  }

  const value: CartContextType = {
    state,
    addToCart,
    removeFromCart,
    updateQuantity,
    toggleSelect,
    selectAll,
    clearCart,
    getCartTotal,
    getSelectedTotal,
    getSelectedCount,
    getTotalItems,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart(): CartContextType {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
