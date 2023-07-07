import axios from "axios";
import { useContext, useState } from "react";

import Dialog from "@mui/material/Dialog";
import { Button, Input } from "@material-tailwind/react";

import { AdminContext } from "@/contexts/AdminContext";
import { LocationId } from "@/libs/locationId";

const TableCreate = () => {
  const { fetchData } = useContext(AdminContext);

  const [open, setOpen] = useState(false);

  const locationId = LocationId();

  const [newTable, setNewTable] = useState({
    name: "",
    locationId: locationId,
  });

  const handleOpen = () => setOpen(!open);

  const createNewTable = async () => {
    const isValid = newTable.name;
    if (!isValid) return alert("Please enter table name");

    await axios.post("/api/admin/tables", { newTable });

    fetchData();
    setOpen(false);
  };

  return (
    <div>
      <Button onClick={handleOpen} variant="gradient">
        Create Table
      </Button>

      <Dialog open={open} onClose={handleOpen}>
        <div className="flex flex-col items-center px-20 py-28 space-y-3">
          <div className="w-[280px]">
            <Input
              type="text"
              label="Table Name"
              onChange={(e) =>
                setNewTable({ ...newTable, name: e.target.value })
              }
            />
          </div>

          <Button onClick={createNewTable} variant="gradient">
            Create Table
          </Button>
        </div>
      </Dialog>
    </div>
  );
};

export default TableCreate;
