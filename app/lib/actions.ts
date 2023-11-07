"use server";

import { sql } from "@vercel/postgres";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const InvoiceSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  amount: z.coerce.number(),
  status: z.enum(["pending", "paid"]),
  date: z.string(),
});

const CreateInvoice = InvoiceSchema.omit({ id: true, date: true });

export async function createInvoice(formData: FormData) {
  // Here if you have a lot of fields you can use Object.fromEntries(formData.entries());
  try {
    const { customerId, amount, status } = CreateInvoice.parse({
      customerId: formData.get("customerId"),
      amount: formData.get("amount"),
      status: formData.get("status"),
    });

    const amountInCents = amount * 100;
    const date = new Date()
      .toISOString()
      .split("T")[0]
      .split("-")
      .toReversed()
      .join("-");

    await sql`INSERT INTO invoices (customer_id,amount,status,date)
            VALUES (${customerId},${amountInCents},${status},${date})`;
  } catch (error: any) {
    return {
      message:
        "Database Error: Failed to create invoice. Exception: " + error.msg,
    };
  }
  revalidatePath("/dashboard/invoices");
  redirect("/dashboard/invoices");
  //   console.log(rawFormData);
}

// Use Zod to update the expected types
const UpdateInvoice = InvoiceSchema.omit({ date: true });

// ...

export async function updateInvoice(id: string, formData: FormData) {
  try {
    const { customerId, amount, status } = UpdateInvoice.parse({
      customerId: formData.get("customerId"),
      amount: formData.get("amount"),
      status: formData.get("status"),
    });

    const amountInCents = amount * 100;

    await sql`
    UPDATE invoices
    SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
    WHERE id = ${id}
  `;
  } catch (error: any) {
    return {
      message:
        "Database Error: Failed to update invoice with id: " +
        id +
        ". Exception: " +
        error.msg,
    };
  }
  revalidatePath("/dashboard/invoices");
  redirect("/dashboard/invoices");
}

export async function deleteInvoice(id: string) {
  throw new Error("Failed to Delete Invoice");
  try {
    await sql`DELETE from invoices WHERE id = ${id}`;
    revalidatePath("/dashboard/invoices");
    return { message: "Deleted invoice with id: " + id };
  } catch (error: any) {
    return {
      message:
        "Database Error: Failed to delete invoice with id: " +
        id +
        ". Exception: " +
        error.msg,
    };
  }
}
