// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { prisma } from "@/libs/db";
import type { NextApiRequest, NextApiResponse } from "next";
import type {
  menus as Menu,
  addons_addon_cats,
  menus_addon_cats,
  menus_locations,
  menus_menu_cats,
} from "@prisma/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const locationId = Number(req.query.locationId);

  if (!locationId) return res.send(400);

  const location = await prisma.locations.findFirst({
    where: { id: locationId },
  });

  const menusLocation = await prisma.menus_locations.findMany({
    where: {
      location_id: locationId,
    },
  });

  const menuIds = menusLocation.map((item: menus_locations) => item.menu_id);

  const menusMenuCat = await prisma.menus_menu_cats.findMany({
    where: {
      menu_id: {
        in: menuIds,
      },
    },
  });

  const menuCatIds = menusMenuCat.map(
    (item: menus_menu_cats) => item.menu_cat_id
  );

  const menusAddonCat = await prisma.menus_addon_cats.findMany({
    where: {
      menu_id: {
        in: menuIds,
      },
    },
  });

  const addonCatIds = menusAddonCat.map(
    (item: menus_addon_cats) => item.addon_cat_id
  );

  const addonAddonCat = await prisma.addons_addon_cats.findMany({
    where: {
      addon_cat_id: {
        in: addonCatIds,
      },
    },
  });

  const addonIds = addonAddonCat.map(
    (item: addons_addon_cats) => item.addon_id
  );

  const menus = await prisma.menus.findMany({
    where: { id: { in: menuIds }, is_archived: false },
  });

  const menuCategories = await prisma.menu_cats.findMany({
    where: { id: { in: menuCatIds }, is_archived: false },
  });

  const addonCategories = await prisma.addon_cats.findMany({
    where: { id: { in: addonCatIds }, is_archived: false },
  });

  const addons = await prisma.addons.findMany({
    where: { id: { in: addonIds }, is_archived: false },
  });

  res.send({
    menus,
    menuCategories,
    addonCategories,
    addons,
    menusLocation,
    menusMenuCat,
    locations: [location],
    menusAddonCat,
    addonAddonCat,
  });
}
