function MovieCard({movie}){
    return(
        
            <article
              key={movie.id}
              className="rounded-xl border border-slate-800 bg-slate-900 p-5"
            >
            {movie.poster_url && (
                <img src={movie.poster_url} alt={`Постер фильма ${movie.title ?? movie.name ?? ''}`} className="mb-4 h-64 w-full rounded-lg object-contain"/>)}
              <h2 className="text-xl font-semibold">
                {movie.title ?? movie.name ?? `Фильм №${movie.id}`}
              </h2>
              

              {movie.description && (
                <p className="mt-3 text-sm text-slate-400">
                  {movie.description}
                </p>
              )}

              {movie.duration && (
                <p className="mt-3 text-sm text-slate-300">
                  Продолжительность: {movie.duration} мин.
                </p>
              )}
            </article>
          
    )
}

export default MovieCard