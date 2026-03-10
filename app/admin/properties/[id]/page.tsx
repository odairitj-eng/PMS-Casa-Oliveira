import { redirect } from 'next/navigation';

export default async function PropertyHubPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    redirect(`/admin/properties/${params.id}/settings`);
}
