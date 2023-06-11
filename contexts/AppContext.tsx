import { createContext, useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import type {
  menus as Menu,
  menu_cats as MenuCategory,
  addon_cats as AddonCategory,
  addons as Addon,
  addons_addon_cats as AddonAddonCat,
  menus_locations as MenusLocation,
  menus_addon_cats as MenuAddonCat,
  locations as Location,
  menus_locations,
  menus_menu_cats,
} from "@prisma/client";

interface AppContextType {
  menus: Menu[];
  menuCategories: MenuCategory[];
  addons: Addon[];
  addonCategories: AddonCategory[];
  addonAddonCat: AddonAddonCat[];
  menusAddonCat: MenuAddonCat[];
  locations: Location[];
  menusLocation: menus_locations[];
  menusMenuCat: menus_menu_cats[];
  accessToken: string;
  updateData: (value: any) => void;
  fetchData: () => void;
}

export const defaultContext: AppContextType = {
  menus: [],
  menuCategories: [],
  addons: [],
  addonCategories: [],
  addonAddonCat: [],
  menusAddonCat: [],
  menusLocation: [],
  menusMenuCat: [],
  locations: [],
  accessToken: "",
  updateData: () => {},
  fetchData: () => {},
};

export const AppContext = createContext<AppContextType>(defaultContext);

const AppProvider = ({ children }: any) => {
  const { data: session } = useSession();

  const [data, updateData] = useState(defaultContext);

  console.log("data is", data);

  const fetchData = async () => {
    const res = await axios.get(`/api/getAllData`);

    const {
      menus,
      menuCategories,
      addonCategories,
      addons,
      menusLocation,
      locations,
      menusAddonCat,
      addonAddonCat,
      menusMenuCat,
    } = res.data;

    updateData({
      ...data,
      menus,
      menuCategories,
      addonCategories,
      addons,
      menusLocation,
      menusMenuCat,
      locations,
      menusAddonCat,
      addonAddonCat,
    });
  };

  useEffect(() => {
    if (session) fetchData();
  }, [session]);

  return (
    <AppContext.Provider value={{ ...data, updateData, fetchData }}>
      {children}
    </AppContext.Provider>
  );
};

export default AppProvider;
