import java.util.List;
import java.util.stream.Collectors;

public class Main {

    private static final String COMPANY = "Colruyt Group";
    private static final String ROLE = "Software Engineer";
    private static final String MAIN_TASK = "support the development teams when having issues and in the meantime renovating our landscape of IT discovering new roadmap items.";
    private static final String RECENT_PROJECT = "automating code refactoring/version updates and kubernetes/containerization of our landscape";
    private static final List<String> OPEN_SOURCE_PROJECTS = List.of("OpenRewrite/Moderne.ai", "Backstage", "ArgoCD", "Liquibase");

    public static void main(String[] args) {
        System.out.println("""
                === Introduction ===
                  Hello, my name is Jente.
                  
                  I work for %s where i am currently active as a %s.
                  My main task is to %s.
                  The last year I have been working on %s.
                  
                  I strongly believe in open source usages for companies as I think the entire world knows more than just one company.
                  I am an official contributor to several open source projects:
                %s
                  I am also a big enthusiast of the advent of code. I have been participating for the last 3 years.
                  
                === End ===
                """.formatted(COMPANY, ROLE, MAIN_TASK, RECENT_PROJECT, getOpenSourceProjects()));
    }

    private static String getOpenSourceProjects() {
        StringBuilder sb = new StringBuilder();
        for (String project : OPEN_SOURCE_PROJECTS) {
            sb.append("\t- ").append(project).append("\n");
        }
        return sb.toString();
//        String projectListItem = "\t- %s\n";
//        return OPEN_SOURCE_PROJECTS.stream().map(project -> projectListItem.formatted(project)).collect(Collectors.joining());
    }
}