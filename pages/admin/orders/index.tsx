import Layout from "@/components/Layout";
import { config } from "@/config/config";
import { AdminContext } from "@/contexts/AdminContext";
import { LocationId } from "@/libs/locationId";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import {
  Box,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography,
} from "@mui/material";
import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import {
  addons as Addon,
  addon_cats as AddonCategory,
  menus as Menu,
  orders as Order,
  OrderStatus,
  orderlines as Orderline,
  addons_addon_cats as AddonAddonCategory,
  orderlines,
} from "@prisma/client";
import { useContext, useState } from "react";

interface Props {
  menus: Menu[];
  addonCategories: AddonCategory[];
  addons: Addon[];
  order: Order;
  orderlines: Orderline[];
  addonAddonCat: AddonAddonCategory[];
}

const Row = ({
  order,
  orderlines,
  menus,
  addons,
  addonCategories,
  addonAddonCat,
}: Props) => {
  const { fetchData } = useContext(AdminContext);
  const [open, setOpen] = useState(false);

  const renderMenusAddonsFromOrder = () => {
    const orderlineMenuIds = getMenuIdsByOrderlines();

    const orderlineMenus = orderlineMenuIds.map((menuId) => {
      const orderlineAddonIds = orderlines
        .filter((item) => item.menu_id === menuId)
        .map((item) => item.addons_id);
      // addon
      const orderlineAddons = addons.filter((item) =>
        orderlineAddonIds.includes(item.id)
      );

      // menu
      const orderlineMenu = menus.find((item) => item.id === menuId) as Menu;

      // status
      const status = orderlines.find((item) => item.menu_id === menuId)
        ?.order_status as OrderStatus;

      // quantiy
      const quantity = orderlines.find((item) => item.menu_id === menuId)
        ?.quantity as number;

      // find respective addons' addoncategories
      const addonsWithCategories: { [key: number]: Addon[] } = {};

      orderlineAddons.forEach((item) => {
        const addonCatId = addonAddonCat.find(
          (addonCat) => addonCat.addon_id === item.id
        )?.addon_cat_id;

        const addonCategory = addonCategories.find(
          (addonCategory) => addonCategory.id === addonCatId
        ) as AddonCategory;

        if (!addonsWithCategories[addonCategory.id]) {
          addonsWithCategories[addonCategory.id] = [item];
        } else {
          addonsWithCategories[addonCategory.id] = [
            ...addonsWithCategories[addonCategory.id],
            item,
          ];
        }
      });

      return { menu: orderlineMenu, addonsWithCategories, status, quantity };
    });

    return (
      <>
        {orderlineMenus.map((item, index) => (
          <Box key={index} sx={{ mr: 2 }}>
            <Paper
              elevation={3}
              sx={{
                width: 250,
                height: 300,
                p: 2,
              }}
            >
              <Box
                sx={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography variant="h6">{item.menu.name}</Typography>
                    <Typography
                      variant="h6"
                      sx={{
                        backgroundColor: "#1B9C85",
                        borderRadius: "50%",
                        width: 30,
                        height: 30,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        color: "white",
                      }}
                    >
                      {item.quantity}
                    </Typography>
                  </Box>
                  <Divider sx={{ my: 1 }} />
                  <Box
                    sx={{
                      maxHeight: "180px",
                      overflow: "scroll",
                    }}
                  >
                    {Object.keys(item.addonsWithCategories).map(
                      (addonCategoryId) => {
                        const addonCategory = addonCategories.find(
                          (item) => item.id === Number(addonCategoryId)
                        ) as AddonCategory;
                        const addons = item.addonsWithCategories[
                          Number(addonCategoryId)
                        ] as Addon[];
                        return (
                          <Box sx={{ mb: 1.5 }} key={addonCategoryId}>
                            <Typography sx={{ fontWeight: "bold" }}>
                              {addonCategory.addon_cat_name}
                            </Typography>
                            <Box sx={{ pl: 2 }}>
                              {addons.map((item) => {
                                return (
                                  <Box key={item.id}>
                                    <Typography
                                      variant="body1"
                                      sx={{ fontStyle: "italic" }}
                                    >
                                      {item.addon_name}
                                    </Typography>
                                  </Box>
                                );
                              })}
                            </Box>
                          </Box>
                        );
                      }
                    )}
                  </Box>
                </Box>
                <Box>
                  <Divider sx={{ mb: 2 }} />
                  <Box
                    sx={{
                      width: "100%",
                      display: "flex",
                      justifyContent: "center",
                    }}
                  >
                    <FormControl sx={{ width: "100%" }}>
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={item.status}
                        label="Status"
                        onChange={handleUpdateOrderStatus}
                      >
                        <MenuItem value={OrderStatus.PENDING}>Pending</MenuItem>
                        <MenuItem value={OrderStatus.PREPARING}>
                          Preparing
                        </MenuItem>
                        <MenuItem value={OrderStatus.COMPLETE}>
                          Complete
                        </MenuItem>
                        <MenuItem value={OrderStatus.REJECTED}>Reject</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                </Box>
              </Box>
            </Paper>
          </Box>
        ))}{" "}
      </>
    );
  };

  const handleUpdateOrderStatus = async (
    evt: SelectChangeEvent<"PENDING" | "PREPARING" | "COMPLETE" | "REJECTED">
  ) => {
    const { orders_id: orderId, menu_id: menuId } = orderlines[0];
    await fetch(`/api/admin/orderlines`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ orderId, menuId, status: evt.target.value }),
    });
    fetchData();
  };

  const getMenuIdsByOrderlines = () => {
    return [...new Set(orderlines.map((orderline) => orderline.menu_id))];
  };

  return (
    <>
      <TableRow sx={{ "& > *": { borderBottom: "unset" } }}>
        <TableCell>
          <IconButton size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell align="right">{order.id}</TableCell>
        <TableCell align="right">{getMenuIdsByOrderlines().length}</TableCell>
        <TableCell align="right">{order.tables_id}</TableCell>
        <TableCell align="right">{order.is_paid ? "Yes" : "No"}</TableCell>
        <TableCell align="right">{order.price}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit sx={{ my: 2 }}>
            <Box sx={{ display: "flex" }}>{renderMenusAddonsFromOrder()}</Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

const Orders = () => {
  const { orders, orderlines, menus, addons, addonCategories, addonAddonCat } =
    useContext(AdminContext);

  const locationId = LocationId();

  const currentLocationOrders = orders.filter(
    (item) => item.locations_id === Number(locationId)
  );

  const getOrderlinesByOrderId = (orderId: number) => {
    return orderlines.filter((item) => item.orders_id === orderId);
  };

  return (
    <Layout>
      <div className="ml-[15rem]">
        <TableContainer component={Paper}>
          <Table aria-label="collapsible table" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell />
                <TableCell align="right">Order Id</TableCell>
                <TableCell align="right">No. of menus</TableCell>
                <TableCell align="right">Table Id</TableCell>
                <TableCell align="right">Paid</TableCell>
                <TableCell align="right">Total price</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {currentLocationOrders.map((order) => (
                <Row
                  key={order.id}
                  menus={menus}
                  addonCategories={addonCategories}
                  addons={addons}
                  order={order}
                  orderlines={getOrderlinesByOrderId(order.id)}
                  addonAddonCat={addonAddonCat}
                />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </Layout>
  );
};

export default Orders;
