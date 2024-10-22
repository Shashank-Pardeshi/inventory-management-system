import React, { useState } from "react";
import {
  TextField,
  Button,
  Box,
  Typography,
  Container,
  CircularProgress,
  Alert,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";

export default function Register() {
  const [formData, setFormData] = useState({
    enterpriseName: "",
    enterpriseDescription: "",
    numberOfStores: "",
    storeDetails: [], // Will contain pairs for each store {inventoryCounters: int, billingCounters: int}
    enterprisePassword: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false); // Loading state
  const [successMessage, setSuccessMessage] = useState(""); // Success feedback
  const [errorMessage, setErrorMessage] = useState(""); // Error feedback
  const [enterpriseId, setEnterpriseId] = useState(null); // Store the unique enterprise ID

  // Validation function
  const validate = () => {
    let tempErrors = {};

    // Enterprise Fields
    if (!formData.enterpriseName.trim())
      tempErrors.enterpriseName = "Enterprise Name is required";
    if (!formData.enterpriseDescription.trim())
      tempErrors.enterpriseDescription = "Enterprise Description is required";
    if (!formData.enterprisePassword.trim())
      tempErrors.enterprisePassword = "Enterprise Password is required";

    // Number of Stores
    if (formData.numberOfStores === "")
      tempErrors.numberOfStores = "Number of Stores is required";
    else if (
      isNaN(formData.numberOfStores) ||
      parseInt(formData.numberOfStores, 10) <= 0
    )
      tempErrors.numberOfStores = "Enter a valid number of stores";

    // Store Details
    if (formData.storeDetails.length > 0) {
      formData.storeDetails.forEach((store, index) => {
        if (
          store.billingCounters === "" ||
          isNaN(store.billingCounters) ||
          parseInt(store.billingCounters, 10) < 0
        ) {
          tempErrors[`billingCounters_${index}`] =
            "Enter a valid number of billing counters";
        }
        if (
          store.inventoryCounters === "" ||
          isNaN(store.inventoryCounters) ||
          parseInt(store.inventoryCounters, 10) < 0
        ) {
          tempErrors[`inventoryCounters_${index}`] =
            "Enter a valid number of inventory counters";
        }
      });
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");
    setEnterpriseId(null); // Reset enterpriseId on new submission

    if (validate()) {
      setLoading(true);
      try {
        // Prepare the payload
        const payload = {
          enterpriseName: formData.enterpriseName,
          enterpriseDescription: formData.enterpriseDescription,
          numberOfStores: parseInt(formData.numberOfStores, 10),
          storeDetails: formData.storeDetails.map((store) => ({
            inventoryCounters: parseInt(store.inventoryCounters, 10),
            billingCounters: parseInt(store.billingCounters, 10),
          })),
          enterprisePassword: formData.enterprisePassword,
        };

        const response = await fetch("/api/gateway/signup", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          // Handle HTTP errors
          const errorData = await response.json();
          throw new Error(errorData.message || "Something went wrong!");
        }

        const data = await response.json();
        setEnterpriseId(data.enterpriseId); // Store the returned enterprise ID

        // Save the relevant data to local storage
        localStorage.setItem("enterpriseId", data.enterpriseId);
        localStorage.setItem("enterpriseName", formData.enterpriseName);
        localStorage.setItem(
          "enterpriseDescription",
          formData.enterpriseDescription
        );

        setSuccessMessage(
          `Registration successful! Your Enterprise ID is: ${data.enterpriseId}`
        );

        // Reset form
        setFormData({
          enterpriseName: "",
          enterpriseDescription: "",
          numberOfStores: "",
          storeDetails: [],
          enterprisePassword: "",
        });
        setErrors({});
      } catch (error) {
        setErrorMessage(error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  // Handle input changes for enterprise fields
  const handleChange = (e) => {
    const { name, value } = e.target;

    // If numberOfStores changes, reset storeDetails
    if (name === "numberOfStores") {
      const num = parseInt(value, 10);
      if (!isNaN(num) && num > 0) {
        setFormData((prevData) => ({
          ...prevData,
          [name]: value,
          storeDetails: Array.from({ length: num }, () => ({
            billingCounters: "",
            inventoryCounters: "",
          })),
        }));
      } else {
        setFormData((prevData) => ({
          ...prevData,
          [name]: value,
          storeDetails: [],
        }));
      }
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  // Handle changes in store details
  const handleStoreChange = (index, field, value) => {
    const updatedStoreDetails = [...formData.storeDetails];
    updatedStoreDetails[index][field] = value;
    setFormData((prevData) => ({
      ...prevData,
      storeDetails: updatedStoreDetails,
    }));
  };

  return (
    <Container
      maxWidth="md"
      sx={{
        mt: 5,
        backgroundColor: "#f4f6f8",
        padding: 4,
        borderRadius: 2,
        boxShadow: 3,
      }}
    >
      <Box display="flex" flexDirection="column" alignItems="center">
        <Typography
          variant="h4"
          gutterBottom
          sx={{ fontWeight: 600, color: "#1976D2" }}
        >
          Create Enterprise Account
        </Typography>
        <Typography variant="body1" gutterBottom sx={{ mb: 3 }}>
          Fill in the details below to register your enterprise
        </Typography>

        {/* Success Message */}
        {successMessage && (
          <Alert severity="success" sx={{ width: "100%", mb: 2 }}>
            {successMessage}
          </Alert>
        )}

        {/* Error Message */}
        {errorMessage && (
          <Alert severity="error" sx={{ width: "100%", mb: 2 }}>
            {errorMessage}
          </Alert>
        )}

        <form onSubmit={handleSubmit} style={{ width: "100%" }}>
          <Box display="flex" flexDirection="column" gap="20px">
            {/* Enterprise Details */}
            <Typography variant="h6" sx={{ mt: 2 }}>
              Enterprise Details
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Enterprise Name"
                  variant="outlined"
                  name="enterpriseName"
                  value={formData.enterpriseName}
                  onChange={handleChange}
                  error={!!errors.enterpriseName}
                  helperText={errors.enterpriseName}
                  fullWidth
                  sx={{ backgroundColor: "#fff" }}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Enterprise Password"
                  variant="outlined"
                  type="password"
                  name="enterprisePassword"
                  value={formData.enterprisePassword}
                  onChange={handleChange}
                  error={!!errors.enterprisePassword}
                  helperText={errors.enterprisePassword}
                  fullWidth
                  sx={{ backgroundColor: "#fff" }}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Enterprise Description"
                  variant="outlined"
                  name="enterpriseDescription"
                  value={formData.enterpriseDescription}
                  onChange={handleChange}
                  error={!!errors.enterpriseDescription}
                  helperText={errors.enterpriseDescription}
                  fullWidth
                  sx={{ backgroundColor: "#fff" }}
                  multiline
                  rows={3}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Number of Stores"
                  variant="outlined"
                  type="number"
                  name="numberOfStores"
                  value={formData.numberOfStores}
                  onChange={handleChange}
                  error={!!errors.numberOfStores}
                  helperText={errors.numberOfStores}
                  fullWidth
                  sx={{ backgroundColor: "#fff" }}
                  InputProps={{ inputProps: { min: 1 } }}
                  required
                />
              </Grid>
            </Grid>

            {/* Store Details Table */}
            {formData.storeDetails.length > 0 && (
              <>
                <Typography variant="h6" sx={{ mt: 2 }}>
                  Store Details
                </Typography>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Store Number</TableCell>
                        <TableCell>Inventory Counters</TableCell>
                        <TableCell>Billing Counters</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {formData.storeDetails.map((store, index) => (
                        <TableRow key={index}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>
                            <TextField
                              type="number"
                              variant="outlined"
                              value={store.inventoryCounters}
                              onChange={(e) =>
                                handleStoreChange(
                                  index,
                                  "inventoryCounters",
                                  e.target.value
                                )
                              }
                              error={!!errors[`inventoryCounters_${index}`]}
                              helperText={errors[`inventoryCounters_${index}`]}
                              InputProps={{ inputProps: { min: 0 } }}
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              type="number"
                              variant="outlined"
                              value={store.billingCounters}
                              onChange={(e) =>
                                handleStoreChange(
                                  index,
                                  "billingCounters",
                                  e.target.value
                                )
                              }
                              error={!!errors[`billingCounters_${index}`]}
                              helperText={errors[`billingCounters_${index}`]}
                              InputProps={{ inputProps: { min: 0 } }}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            )}

            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
              sx={{ mt: 3 }}
            >
              {loading ? <CircularProgress size={24} /> : "Register Enterprise"}
            </Button>
          </Box>
        </form>
      </Box>
    </Container>
  );
}
