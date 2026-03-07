import { redirect } from 'next/navigation';

export default function PropertyHubPage({ params }: { params: { id: string } }) {
    redirect(`/admin/properties/${params.id}/settings`);
}
