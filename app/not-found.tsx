import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
            <h2 className="text-4xl font-bold text-olive-900 mb-4">Página Não Encontrada</h2>
            <p className="text-lg text-olive-900/60 mb-8">
                Ops! O imóvel que você está procurando não existe, está desativado no momento, ou o link está quebrado.
            </p>
            <Link
                href="/"
                className="px-6 py-3 bg-olive-900 text-white font-bold rounded-xl hover:bg-olive-800 transition-colors"
            >
                Voltar para a Página Inicial
            </Link>
        </div>
    );
}
