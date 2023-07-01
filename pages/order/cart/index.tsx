import { OrderContext } from "@/contexts/OrderContext";
import { Avatar, Box, Button, Typography } from "@mui/material";
import { addons as Addon } from "@prisma/client";
import { useRouter } from "next/router";
import { useContext, useEffect } from "react";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { CartItem } from "@/libs/types";

const Review = () => {
  const { ...data } = useContext(OrderContext);
  const { cart, updateData, fetchData } = useContext(OrderContext);
  const router = useRouter();
  const query = router.query;

  const removeOrderlinFromCart = (cartItem: CartItem) => {
    const remainingOrderlines = cart.filter(
      (item) => item.menu.id !== cartItem.menu.id
    );
    updateData({ ...data, orderlines: remainingOrderlines });
  };

  const editOrder = (cartItem: CartItem) => {
    router.push({
      pathname: `/order/menus/${cartItem.menu.id}`,
      query,
    });
  };

  const confirmOrder = async () => {
    const { locationId, tableId } = query;
    const isValid = locationId && tableId && cart.length;

    if (!isValid) return alert("Required locationId and tableId");
    const response = await fetch(
      `/api/order?locationId=${locationId}&tableId=${tableId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cart }),
      }
    );
    const responseJSON = await response.json();
    const order = responseJSON.order;
    fetchData();
    router.push({ pathname: `/order/activeOrder/${order.id}`, query });
  };

  if (!cart.length)
    return (
      <div>
        <h1>You Not Order . . .</h1>
      </div>
    );

  const renderAddons = (addons: Addon[]) => {
    if (!addons.length) return;
    return addons.map((item) => {
      return (
        <Box
          key={item.id}
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography>{item.addon_name}</Typography>
          <Typography>{item.price}</Typography>
        </Box>
      );
    });
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        p: 3,
      }}
    >
      <Box
        sx={{
          width: { xs: "100%", md: "500px" },
        }}
      >
        <Typography variant="h5" sx={{ textAlign: "center", mb: 3 }}>
          Review your order
        </Typography>
        {cart.map((cartItem, index) => {
          const { menu, addons, quantity } = cartItem;
          return (
            <Box key={index}>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Avatar
                  sx={{
                    width: 25,
                    height: 25,
                    mr: 1,
                    backgroundColor: "green",
                  }}
                >
                  {quantity}
                </Avatar>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    width: "100%",
                  }}
                >
                  <Typography variant="h6">{menu.name}</Typography>
                  <Typography variant="h6">{menu.price}</Typography>
                </Box>
              </Box>
              <Box sx={{ pl: 6 }}>{renderAddons(addons)}</Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  mb: 3,
                  mt: 1,
                }}
              >
                <DeleteIcon
                  sx={{ mr: 2, cursor: "pointer" }}
                  onClick={() => removeOrderlinFromCart(cartItem)}
                />
                <EditIcon
                  sx={{ cursor: "pointer" }}
                  onClick={() => editOrder(cartItem)}
                />
              </Box>
            </Box>
          );
        })}
        <Box sx={{ mt: 3, textAlign: "center" }} onClick={confirmOrder}>
          <Button variant="contained">Confirm order</Button>
        </Box>
      </Box>
    </Box>
  );
};

export default Review;
