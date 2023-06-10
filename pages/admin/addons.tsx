import Layout from "@/components/Layout";
import { Box, TextField, Dialog } from "@mui/material";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { AppContext } from "@/contexts/AppContext";
import LocationsSelect from "@/components/LocationsSelect";
import { LocationId } from "@/libs/locationId";
import MenuCatSelect from "@/components/MenuCatSelect";
import MenuSelect from "@/components/MenuSelect";
import { addon_cats } from "@prisma/client";
import AddonCatSelect from "@/components/AddonCatSelect";
import { Button, Input } from "@material-tailwind/react";

const CreateAddons = () => {
  const locationId = Number(LocationId());

  const {
    // addonCategories,
    // addons,
    // menusAddonCat,
    // addonAddonCat,
    // menusMenuCatAddonCatLocation,
    fetchData,
  } = useContext(AppContext);

  const [addonCategories, setAddonCategories] = useState<addon_cats[]>();

  const [count, setCount] = useState(0);
  const [addonCatName, setAddonCatName] = useState({
    name: "",
    menuIds: [],
  });
  const [addonName, setAddonName] = useState<String[]>([]);
  const [addonPrice, setAddonPrice] = useState<Number[]>([]);

  const addonIds = Array.from({ length: count }, (_, index) => index + 1);

  const addonNames = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    index: number
  ) => {
    const updatedValues = [...addonName];
    updatedValues[index] = e.target.value;
    setAddonName(updatedValues);
  };

  const addonPrices = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    index: number
  ) => {
    const updatedValues = [...addonPrice];
    updatedValues[index] = Number(e.target.value);
    setAddonPrice(updatedValues);
  };

  const menuStateChange = (childStateSelectedMenuIds: any) => {
    setAddonCatName({
      ...addonCatName,
      menuIds: childStateSelectedMenuIds,
    });
  };

  const createAddon = async () => {
    const res = await axios.post(`/api/createAddon`, {
      addonCatName,
      addonName,
      addonPrice,
    });

    console.log(res);

    setAddonCatName({
      name: "",
      menuIds: [],
    });
    setAddonName([]);
    setAddonPrice([]);
    setCount(0);

    fetchData();
  };

  const getAddon = async (id: number) => {
    const res = await axios.get(`/api/createAddon?id=${id}`);
    const { addonCategories } = res.data;

    setAddonCategories(addonCategories);

    console.log("sldsdsldsd", addonCategories, id);
  };

  useEffect(() => {
    getAddon(locationId);
  }, [locationId]);

  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(!open);
    setAddonCatName({
      name: "",
      menuIds: [],
    });
    setAddonName([]);
    setAddonPrice([]);
    setCount(0);
  };

  return (
    <Layout>
      <div className="absolute top-[5.5rem] right-10">
        <Button onClick={handleOpen} variant="gradient">
          Create Addon
        </Button>
      </div>

      <Dialog open={open} onClose={handleOpen}>
        <div className="w-full flex flex-col items-center px-20 py-24 space-y-1">
          <div className="w-[280px] space-y-3">
            <Input
              type="text"
              label="Addon Name"
              onChange={(e) =>
                setAddonCatName({ ...addonCatName, name: e.target.value })
              }
            />

            <Input
              type="number"
              label="Price"
              onChange={(e) =>
                setAddonCatName({ ...addonCatName, name: e.target.value })
              }
            />
          </div>
          <AddonCatSelect />
          {/* <div className="space-y-3">
            {addonIds &&
              addonIds.map((e, index) => (
                <div key={index} className="flex justify-around space-x-3">
                  <Input
                    type="text"
                    label="Addon Name"
                    onChange={(e) => addonNames(e, index)}
                  />

                  <Input
                    type="number"
                    label="Price"
                    onChange={(e) => addonPrices(e, index)}
                  />
                </div>
              ))}
          </div>
          <div className="flex flex-col items-center space-y-2">
            <Button
              onClick={() => {
                setCount(count + 1);
              }}
              className="text-base rounded-full"
            >
              +
            </Button>
          </div> */}
          <Button onClick={createAddon} variant="gradient">
            Create Addon
          </Button>
        </div>
      </Dialog>

      <Box
        sx={{
          textAlign: "center",
        }}
      >
        <AddonCatSelect addonCategories={addonCategories} />
      </Box>
    </Layout>
  );
};

export default CreateAddons;