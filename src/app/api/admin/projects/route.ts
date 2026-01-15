import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json(
    await prisma.project.findMany({
      include: {
        contributions: {
            include: {
            contributor: true, // fetch the contributor for each contribution
            },
        },
        links: true,
        images: true,
        project_sub_pages: true,
      },
    })
  )
}

export async function POST(req: Request) {
  const data = await req.json()
  return NextResponse.json(
    await prisma.project.create({ data })
  )
}

export async function PUT(req: Request) {
  const { id, ...data } = await req.json()
  return NextResponse.json(
    await prisma.project.update({ where: { id }, data })
  )
}

export async function DELETE(req: Request) {
  const { id } = await req.json()
  await prisma.project.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}

