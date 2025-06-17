import app from "./src/app/app";
import userRouter from "./src/route/user.route";
import productRoute from "./src/route/product.route";
import actionsRoute from "./src/route/actions.route";

import "./workers/reviewWorker";

const PORT: number = Number(process.env.PORT) || 3000;

// Route Mounting
app.use("/api/users", userRouter);
app.use("/api/products", productRoute);
app.use("/api/actions", actionsRoute);

// Start Server
app.listen(PORT, () => {
  console.log(` Server is running at http://localhost:${PORT}`);
});
